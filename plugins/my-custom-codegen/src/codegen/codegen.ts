import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { DetailedError, codegen, mergeSchemas } from '@graphql-codegen/core';
import Listr from 'listr';
import { normalizeInstanceOrArray, normalizeConfig, isOutputConfigArray } from '@graphql-codegen/plugin-helpers';
import { GraphQLError, DocumentNode, buildASTSchema } from 'graphql';

import { Renderer } from './utils/listr-renderer';
import { debugLog } from './utils/debugging';
import { tryToBuildSchema } from './utils/try-to-build-schema';
import { loadSchema, loadDocuments } from './load';
import { getPluginByName } from './plugins';
import { getPresetByName } from './presets';
import { CustomConfig } from './config';

export const defaultLoader = (mod: string) => import(mod);

const defaultPlugins: Types.OutputConfig = ['typescript', 'typescript-operations'];

export function isConfiguredOutput(type: any): type is Types.ConfiguredOutput {
  return typeof type === 'object';
}

export function normalizeOutputParam(config: Types.OutputConfig | Types.ConfiguredOutput): Types.ConfiguredOutput {
  // In case of direct array with a list of plugins
  if (isOutputConfigArray(config)) {
    return {
      documents: [],
      schema: [],
      plugins: config.concat(defaultPlugins),
    };
  } else if (isConfiguredOutput(config)) {
    if (config === null) {
      config = {
        plugins: [],
      } as Types.ConfiguredOutput;
    }
    config.plugins = config.plugins || [];
    if (isOutputConfigArray(config.plugins)) {
      if (!config.plugins.includes('typescript')) config.plugins.push('typescript');
      if (!config.plugins.includes('typescript-operations')) config.plugins.push('typescript-operations');
    } else {
      config.plugins = [config.plugins].concat(defaultPlugins);
    }
    return config;
  } else {
    throw new Error(`Invalid "generates" config!`);
  }
}

export async function executeCodegen(config: CustomConfig): Promise<Types.FileOutput[]> {
  function wrapTask(task: () => void | Promise<void>, source?: string) {
    return async () => {
      try {
        await Promise.resolve().then(() => task());
      } catch (error) {
        if (source && !(error instanceof GraphQLError)) {
          error.source = source;
        }

        throw error;
      }
    };
  }

  const result: Types.FileOutput[] = [];
  const commonListrOptions = {
    exitOnError: true,
  };
  let listr: Listr;

  if (process.env.VERBOSE) {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'verbose',
      nonTTYRenderer: 'verbose',
    });
  } else if (process.env.NODE_ENV === 'test') {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'silent',
      nonTTYRenderer: 'silent',
    });
  } else {
    listr = new Listr({
      ...commonListrOptions,
      renderer: config.silent ? 'silent' : Renderer,
      nonTTYRenderer: config.silent ? 'silent' : 'default',
      collapse: true,
      clearOutput: false,
    } as any);
  }

  let rootConfig: { [key: string]: any } = {};
  let rootSchemas: (Types.Schema | undefined)[];
  let rootDocuments: (Types.OperationDocument | undefined)[];
  let generates: { [filename: string]: Types.ConfiguredOutput } = {};

  async function normalize() {
    /* Load Require extensions */
    const requireExtensions = normalizeInstanceOrArray<string | undefined>(config.require);
    for (const mod of requireExtensions) {
      mod && (await import(mod));
    }

    /* Root templates-config */
    rootConfig = config.config || {};

    /* Normalize root "schema" field */
    rootSchemas = normalizeInstanceOrArray<Types.Schema | undefined>(config.schema);

    /* Normalize root "documents" field */
    rootDocuments = normalizeInstanceOrArray<Types.OperationDocument | undefined>(config.documents);

    /* Normalize "generators" field */
    const generateKeys = Object.keys(config.generates);

    if (generateKeys.length === 0) {
      throw new DetailedError(
        'Invalid Codegen Configuration!',
        `
        Please make sure that your codegen config file contains the "generates" field, with a specification for the plugins you need.

        It should looks like that:

        generates:
          my-file.ts:
            - plugin1
            - plugin2
            - plugin3
        `,
      );
    }

    for (const filename of generateKeys) {
      generates[filename] = normalizeOutputParam(config.generates[filename]);
    }
  }

  listr.add({
    title: 'Parse configuration',
    task: () => normalize(),
  });

  listr.add({
    title: 'Generate outputs',
    task: () => {
      return new Listr(
        Object.keys(generates).map<Listr.ListrTask>((filename, i) => {
          const outputConfig = generates[filename];
          const hasPreset = !!outputConfig.preset;

          return {
            title: hasPreset
              ? `Generate to ${filename} (using EXPERIMENTAL preset "${outputConfig.preset}")`
              : `Generate ${filename}`,
            task: () => {
              const outputFileTemplateConfig = outputConfig.config || {};
              const outputDocuments: Types.DocumentFile[] = [];
              let outputSchema: DocumentNode;
              const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema | undefined>(outputConfig.schema);
              const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument | undefined>(
                outputConfig.documents,
              );

              return new Listr(
                [
                  {
                    title: 'Load GraphQL schemas',
                    task: wrapTask(async () => {
                      debugLog(`[CLI] Loading Schemas`);
                      const allSchemas = [
                        ...rootSchemas.map(pointToSchema => (pointToSchema ? loadSchema(pointToSchema, config) : null)),
                        ...outputSpecificSchemas.map(pointToSchema =>
                          pointToSchema ? loadSchema(pointToSchema, config) : null,
                        ),
                      ];

                      const validSchema = allSchemas.filter(a => a) as Promise<DocumentNode>[];

                      if (validSchema.length > 0) {
                        outputSchema = mergeSchemas([config.defaultSchema, ...(await Promise.all(validSchema))]);
                      }
                    }, filename),
                  },
                  {
                    title: 'Load GraphQL documents',
                    task: wrapTask(async () => {
                      debugLog(`[CLI] Loading Documents`);
                      const allDocuments = [...rootDocuments, ...outputSpecificDocuments] as Types.InstanceOrArray<
                        Types.OperationDocument
                      >;
                      const documents = await loadDocuments(allDocuments, config);

                      if (documents.length > 0) {
                        outputDocuments.push(...documents);
                      }
                    }, filename),
                  },
                  {
                    title: 'Generate',
                    task: wrapTask(async () => {
                      debugLog(`[CLI] Generating output`);
                      const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);
                      const pluginLoader = config.pluginLoader || defaultLoader;
                      const pluginPackages = await Promise.all(
                        normalizedPluginsArray.map(plugin => getPluginByName(Object.keys(plugin)[0], pluginLoader)),
                      );
                      const pluginMap: { [name: string]: CodegenPlugin } = {};
                      const preset: Types.OutputPreset | null = hasPreset
                        ? typeof outputConfig.preset === 'string'
                          ? await getPresetByName(outputConfig.preset, defaultLoader)
                          : outputConfig.preset!
                        : null;

                      pluginPackages.forEach((pluginPackage, i) => {
                        const plugin = normalizedPluginsArray[i];
                        const name = Object.keys(plugin)[0];

                        pluginMap[name] = pluginPackage;
                      });

                      const mergedConfig = {
                        ...rootConfig,
                        ...(typeof outputFileTemplateConfig === 'string'
                          ? { value: outputFileTemplateConfig }
                          : outputFileTemplateConfig),
                      };

                      let outputs: Types.GenerateOptions[] = [];
                      const builtSchema = tryToBuildSchema(outputSchema);

                      if (hasPreset && preset) {
                        outputs = await preset.buildGeneratesSection({
                          baseOutputDir: filename,
                          presetConfig: outputConfig.presetConfig || {},
                          plugins: normalizedPluginsArray,
                          schema: outputSchema,
                          schemaAst: builtSchema,
                          documents: outputDocuments,
                          config: mergedConfig,
                          pluginMap,
                        });
                      } else {
                        outputs = [
                          {
                            filename,
                            plugins: normalizedPluginsArray,
                            schema: outputSchema,
                            schemaAst: builtSchema,
                            documents: outputDocuments,
                            config: mergedConfig,
                            pluginMap,
                          },
                        ];
                      }

                      const process = async (outputArgs: Types.GenerateOptions) => {
                        const output = await codegen(outputArgs);
                        result.push({
                          filename: outputArgs.filename,
                          content: output,
                          hooks: outputConfig.hooks || {},
                        });
                      };

                      await Promise.all(outputs.map(process));
                    }, filename),
                  },
                ],
                {
                  // it stops when one of tasks failed
                  exitOnError: true,
                },
              );
            },
          };
        }),
        {
          // it doesn't stop when one of tasks failed, to finish at least some of outputs
          exitOnError: false,
          // run 4 at once
          concurrent: 4,
        },
      );
    },
  });

  await listr.run();

  return result;
}
