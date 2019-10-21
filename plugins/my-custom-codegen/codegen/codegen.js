"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isConfiguredOutput = isConfiguredOutput;
exports.normalizeOutputParam = normalizeOutputParam;
exports.executeCodegen = executeCodegen;
exports.defaultLoader = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _core = require("@graphql-codegen/core");

var _listr = _interopRequireDefault(require("listr"));

var _pluginHelpers = require("@graphql-codegen/plugin-helpers");

var _graphql = require("graphql");

var _listrRenderer = require("./utils/listr-renderer");

var _debugging = require("./utils/debugging");

var _tryToBuildSchema = require("./utils/try-to-build-schema");

var _load = require("./load");

var _plugins = require("./plugins");

var _presets = require("./presets");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const defaultLoader = mod => Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${mod}`)));

exports.defaultLoader = defaultLoader;
const defaultPlugins = ['typescript', 'typescript-operations'];

function isConfiguredOutput(type) {
  return typeof type === 'object';
}

function normalizeOutputParam(config) {
  // In case of direct array with a list of plugins
  if ((0, _pluginHelpers.isOutputConfigArray)(config)) {
    return {
      documents: [],
      schema: [],
      plugins: config.concat(defaultPlugins)
    };
  } else if (isConfiguredOutput(config)) {
    if (config === null) {
      config = {
        plugins: []
      };
    }

    config.plugins = config.plugins || [];

    if ((0, _pluginHelpers.isOutputConfigArray)(config.plugins)) {
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

async function executeCodegen(config) {
  function wrapTask(task, source) {
    return async () => {
      try {
        await Promise.resolve().then(() => task());
      } catch (error) {
        if (source && !(error instanceof _graphql.GraphQLError)) {
          error.source = source;
        }

        throw error;
      }
    };
  }

  const result = [];
  const commonListrOptions = {
    exitOnError: true
  };
  let listr;

  if (process.env.VERBOSE) {
    listr = new _listr.default(_objectSpread({}, commonListrOptions, {
      renderer: 'verbose',
      nonTTYRenderer: 'verbose'
    }));
  } else if (process.env.NODE_ENV === 'test') {
    listr = new _listr.default(_objectSpread({}, commonListrOptions, {
      renderer: 'silent',
      nonTTYRenderer: 'silent'
    }));
  } else {
    listr = new _listr.default(_objectSpread({}, commonListrOptions, {
      renderer: config.silent ? 'silent' : _listrRenderer.Renderer,
      nonTTYRenderer: config.silent ? 'silent' : 'default',
      collapse: true,
      clearOutput: false
    }));
  }

  let rootConfig = {};
  let rootSchemas;
  let rootDocuments;
  let generates = {};

  async function normalize() {
    /* Load Require extensions */
    const requireExtensions = (0, _pluginHelpers.normalizeInstanceOrArray)(config.require);

    for (const mod of requireExtensions) {
      mod && (await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${mod}`))));
    }
    /* Root templates-config */


    rootConfig = config.config || {};
    /* Normalize root "schema" field */

    rootSchemas = (0, _pluginHelpers.normalizeInstanceOrArray)(config.schema);
    /* Normalize root "documents" field */

    rootDocuments = (0, _pluginHelpers.normalizeInstanceOrArray)(config.documents);
    /* Normalize "generators" field */

    const generateKeys = Object.keys(config.generates);

    if (generateKeys.length === 0) {
      throw new _core.DetailedError('Invalid Codegen Configuration!', `
        Please make sure that your codegen config file contains the "generates" field, with a specification for the plugins you need.

        It should looks like that:

        generates:
          my-file.ts:
            - plugin1
            - plugin2
            - plugin3
        `);
    }

    for (const filename of generateKeys) {
      generates[filename] = normalizeOutputParam(config.generates[filename]);
    }
  }

  listr.add({
    title: 'Parse configuration',
    task: () => normalize()
  });
  listr.add({
    title: 'Generate outputs',
    task: () => {
      return new _listr.default(Object.keys(generates).map((filename, i) => {
        const outputConfig = generates[filename];
        const hasPreset = !!outputConfig.preset;
        return {
          title: hasPreset ? `Generate to ${filename} (using EXPERIMENTAL preset "${outputConfig.preset}")` : `Generate ${filename}`,
          task: () => {
            const outputFileTemplateConfig = outputConfig.config || {};
            const outputDocuments = [];
            let outputSchema;
            const outputSpecificSchemas = (0, _pluginHelpers.normalizeInstanceOrArray)(outputConfig.schema);
            const outputSpecificDocuments = (0, _pluginHelpers.normalizeInstanceOrArray)(outputConfig.documents);
            return new _listr.default([{
              title: 'Load GraphQL schemas',
              task: wrapTask(async () => {
                (0, _debugging.debugLog)(`[CLI] Loading Schemas`);
                const allSchemas = [...rootSchemas.map(pointToSchema => pointToSchema ? (0, _load.loadSchema)(pointToSchema, config) : null), ...outputSpecificSchemas.map(pointToSchema => pointToSchema ? (0, _load.loadSchema)(pointToSchema, config) : null)];
                const validSchema = allSchemas.filter(a => a);

                if (validSchema.length > 0) {
                  outputSchema = (0, _core.mergeSchemas)([config.defaultSchema, ...(await Promise.all(validSchema))]);
                }
              }, filename)
            }, {
              title: 'Load GraphQL documents',
              task: wrapTask(async () => {
                (0, _debugging.debugLog)(`[CLI] Loading Documents`);
                const allDocuments = [...rootDocuments, ...outputSpecificDocuments];
                const documents = await (0, _load.loadDocuments)(allDocuments, config);

                if (documents.length > 0) {
                  outputDocuments.push(...documents);
                }
              }, filename)
            }, {
              title: 'Generate',
              task: wrapTask(async () => {
                (0, _debugging.debugLog)(`[CLI] Generating output`);
                const normalizedPluginsArray = (0, _pluginHelpers.normalizeConfig)(outputConfig.plugins);
                const pluginLoader = config.pluginLoader || defaultLoader;
                const pluginPackages = await Promise.all(normalizedPluginsArray.map(plugin => (0, _plugins.getPluginByName)(Object.keys(plugin)[0], pluginLoader)));
                const pluginMap = {};
                const preset = hasPreset ? typeof outputConfig.preset === 'string' ? await (0, _presets.getPresetByName)(outputConfig.preset, defaultLoader) : outputConfig.preset : null;
                pluginPackages.forEach((pluginPackage, i) => {
                  const plugin = normalizedPluginsArray[i];
                  const name = Object.keys(plugin)[0];
                  pluginMap[name] = pluginPackage;
                });

                const mergedConfig = _objectSpread({}, rootConfig, {}, typeof outputFileTemplateConfig === 'string' ? {
                  value: outputFileTemplateConfig
                } : outputFileTemplateConfig);

                let outputs = [];
                const builtSchema = (0, _tryToBuildSchema.tryToBuildSchema)(outputSchema);

                if (hasPreset && preset) {
                  outputs = await preset.buildGeneratesSection({
                    baseOutputDir: filename,
                    presetConfig: outputConfig.presetConfig || {},
                    plugins: normalizedPluginsArray,
                    schema: outputSchema,
                    schemaAst: builtSchema,
                    documents: outputDocuments,
                    config: mergedConfig,
                    pluginMap
                  });
                } else {
                  outputs = [{
                    filename,
                    plugins: normalizedPluginsArray,
                    schema: outputSchema,
                    schemaAst: builtSchema,
                    documents: outputDocuments,
                    config: mergedConfig,
                    pluginMap
                  }];
                }

                const process = async outputArgs => {
                  const output = await (0, _core.codegen)(outputArgs);
                  result.push({
                    filename: outputArgs.filename,
                    content: output,
                    hooks: outputConfig.hooks || {}
                  });
                };

                await Promise.all(outputs.map(process));
              }, filename)
            }], {
              // it stops when one of tasks failed
              exitOnError: true
            });
          }
        };
      }), {
        // it doesn't stop when one of tasks failed, to finish at least some of outputs
        exitOnError: false,
        // run 4 at once
        concurrent: 4
      });
    }
  });
  await listr.run();
  return result;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2RlZ2VuL2NvZGVnZW4udHMiXSwibmFtZXMiOlsiZGVmYXVsdExvYWRlciIsIm1vZCIsImRlZmF1bHRQbHVnaW5zIiwiaXNDb25maWd1cmVkT3V0cHV0IiwidHlwZSIsIm5vcm1hbGl6ZU91dHB1dFBhcmFtIiwiY29uZmlnIiwiZG9jdW1lbnRzIiwic2NoZW1hIiwicGx1Z2lucyIsImNvbmNhdCIsImluY2x1ZGVzIiwicHVzaCIsIkVycm9yIiwiZXhlY3V0ZUNvZGVnZW4iLCJ3cmFwVGFzayIsInRhc2siLCJzb3VyY2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJlcnJvciIsIkdyYXBoUUxFcnJvciIsInJlc3VsdCIsImNvbW1vbkxpc3RyT3B0aW9ucyIsImV4aXRPbkVycm9yIiwibGlzdHIiLCJwcm9jZXNzIiwiZW52IiwiVkVSQk9TRSIsIkxpc3RyIiwicmVuZGVyZXIiLCJub25UVFlSZW5kZXJlciIsIk5PREVfRU5WIiwic2lsZW50IiwiUmVuZGVyZXIiLCJjb2xsYXBzZSIsImNsZWFyT3V0cHV0Iiwicm9vdENvbmZpZyIsInJvb3RTY2hlbWFzIiwicm9vdERvY3VtZW50cyIsImdlbmVyYXRlcyIsIm5vcm1hbGl6ZSIsInJlcXVpcmVFeHRlbnNpb25zIiwicmVxdWlyZSIsImdlbmVyYXRlS2V5cyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJEZXRhaWxlZEVycm9yIiwiZmlsZW5hbWUiLCJhZGQiLCJ0aXRsZSIsIm1hcCIsImkiLCJvdXRwdXRDb25maWciLCJoYXNQcmVzZXQiLCJwcmVzZXQiLCJvdXRwdXRGaWxlVGVtcGxhdGVDb25maWciLCJvdXRwdXREb2N1bWVudHMiLCJvdXRwdXRTY2hlbWEiLCJvdXRwdXRTcGVjaWZpY1NjaGVtYXMiLCJvdXRwdXRTcGVjaWZpY0RvY3VtZW50cyIsImFsbFNjaGVtYXMiLCJwb2ludFRvU2NoZW1hIiwidmFsaWRTY2hlbWEiLCJmaWx0ZXIiLCJhIiwiZGVmYXVsdFNjaGVtYSIsImFsbCIsImFsbERvY3VtZW50cyIsIm5vcm1hbGl6ZWRQbHVnaW5zQXJyYXkiLCJwbHVnaW5Mb2FkZXIiLCJwbHVnaW5QYWNrYWdlcyIsInBsdWdpbiIsInBsdWdpbk1hcCIsImZvckVhY2giLCJwbHVnaW5QYWNrYWdlIiwibmFtZSIsIm1lcmdlZENvbmZpZyIsInZhbHVlIiwib3V0cHV0cyIsImJ1aWx0U2NoZW1hIiwiYnVpbGRHZW5lcmF0ZXNTZWN0aW9uIiwiYmFzZU91dHB1dERpciIsInByZXNldENvbmZpZyIsInNjaGVtYUFzdCIsIm91dHB1dEFyZ3MiLCJvdXRwdXQiLCJjb250ZW50IiwiaG9va3MiLCJjb25jdXJyZW50IiwicnVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFHTyxNQUFNQSxhQUFhLEdBQUlDLEdBQUQsa0ZBQXdCQSxHQUF4QixLQUF0Qjs7O0FBRVAsTUFBTUMsY0FBa0MsR0FBRyxDQUFDLFlBQUQsRUFBZSx1QkFBZixDQUEzQzs7QUFFTyxTQUFTQyxrQkFBVCxDQUE0QkMsSUFBNUIsRUFBdUU7QUFDNUUsU0FBTyxPQUFPQSxJQUFQLEtBQWdCLFFBQXZCO0FBQ0Q7O0FBRU0sU0FBU0Msb0JBQVQsQ0FBOEJDLE1BQTlCLEVBQTJHO0FBQ2hIO0FBQ0EsTUFBSSx3Q0FBb0JBLE1BQXBCLENBQUosRUFBaUM7QUFDL0IsV0FBTztBQUNMQyxNQUFBQSxTQUFTLEVBQUUsRUFETjtBQUVMQyxNQUFBQSxNQUFNLEVBQUUsRUFGSDtBQUdMQyxNQUFBQSxPQUFPLEVBQUVILE1BQU0sQ0FBQ0ksTUFBUCxDQUFjUixjQUFkO0FBSEosS0FBUDtBQUtELEdBTkQsTUFNTyxJQUFJQyxrQkFBa0IsQ0FBQ0csTUFBRCxDQUF0QixFQUFnQztBQUNyQyxRQUFJQSxNQUFNLEtBQUssSUFBZixFQUFxQjtBQUNuQkEsTUFBQUEsTUFBTSxHQUFHO0FBQ1BHLFFBQUFBLE9BQU8sRUFBRTtB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akUsS0FBSyxDQUFDa0UsR0FBTixFQUFOO0FBRUEsU0FBT3JFLE1BQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR5cGVzLCBDb2RlZ2VuUGx1Z2luIH0gZnJvbSAnQGdyYXBocWwtY29kZWdlbi9wbHVnaW4taGVscGVycyc7XG5pbXBvcnQgeyBEZXRhaWxlZEVycm9yLCBjb2RlZ2VuLCBtZXJnZVNjaGVtYXMgfSBmcm9tICdAZ3JhcGhxbC1jb2RlZ2VuL2NvcmUnO1xuaW1wb3J0IExpc3RyIGZyb20gJ2xpc3RyJztcbmltcG9ydCB7IG5vcm1hbGl6ZUluc3RhbmNlT3JBcnJheSwgbm9ybWFsaXplQ29uZmlnLCBpc091dHB1dENvbmZpZ0FycmF5IH0gZnJvbSAnQGdyYXBocWwtY29kZWdlbi9wbHVnaW4taGVscGVycyc7XG5pbXBvcnQgeyBHcmFwaFFMRXJyb3IsIERvY3VtZW50Tm9kZSwgYnVpbGRBU1RTY2hlbWEgfSBmcm9tICdncmFwaHFsJztcblxuaW1wb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3V0aWxzL2xpc3RyLXJlbmRlcmVyJztcbmltcG9ydCB7IGRlYnVnTG9nIH0gZnJvbSAnLi91dGlscy9kZWJ1Z2dpbmcnO1xuaW1wb3J0IHsgdHJ5VG9CdWlsZFNjaGVtYSB9IGZyb20gJy4vdXRpbHMvdHJ5LXRvLWJ1aWxkLXNjaGVtYSc7XG5pbXBvcnQgeyBsb2FkU2NoZW1hLCBsb2FkRG9jdW1lbnRzIH0gZnJvbSAnLi9sb2FkJztcbmltcG9ydCB7IGdldFBsdWdpbkJ5TmFtZSB9IGZyb20gJy4vcGx1Z2lucyc7XG5pbXBvcnQgeyBnZXRQcmVzZXRCeU5hbWUgfSBmcm9tICcuL3ByZXNldHMnO1xuaW1wb3J0IHsgQ3VzdG9tQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdExvYWRlciA9IChtb2Q6IHN0cmluZykgPT4gaW1wb3J0KG1vZCk7XG5cbmNvbnN0IGRlZmF1bHRQbHVnaW5zOiBUeXBlcy5PdXRwdXRDb25maWcgPSBbJ3R5cGVzY3JpcHQnLCAndHlwZXNjcmlwdC1vcGVyYXRpb25zJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbmZpZ3VyZWRPdXRwdXQodHlwZTogYW55KTogdHlwZSBpcyBUeXBlcy5Db25maWd1cmVkT3V0cHV0IHtcbiAgcmV0dXJuIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU91dHB1dFBhcmFtKGNvbmZpZzogVHlwZXMuT3V0cHV0Q29uZmlnIHwgVHlwZXMuQ29uZmlndXJlZE91dHB1dCk6IFR5cGVzLkNvbmZpZ3VyZWRPdXRwdXQge1xuICAvLyBJbiBjYXNlIG9mIGRpcmVjdCBhcnJheSB3aXRoIGEgbGlzdCBvZiBwbHVnaW5zXG4gIGlmIChpc091dHB1dENvbmZpZ0FycmF5KGNvbmZpZykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZG9jdW1lbnRzOiBbXSxcbiAgICAgIHNjaGVtYTogW10sXG4gICAgICBwbHVnaW5zOiBjb25maWcuY29uY2F0KGRlZmF1bHRQbHVnaW5zKSxcbiAgICB9O1xuICB9IGVsc2UgaWYgKGlzQ29uZmlndXJlZE91dHB1dChjb25maWcpKSB7XG4gICAgaWYgKGNvbmZpZyA9PT0gbnVsbCkge1xuICAgICAgY29uZmlnID0ge1xuICAgICAgICBwbHVnaW5zOiBbXSxcbiAgICAgIH0gYXMgVHlwZXMuQ29uZmlndXJlZE91dHB1dDtcbiAgICB9XG4gICAgY29uZmlnLnBsdWdpbnMgPSBjb25maWcucGx1Z2lucyB8fCBbXTtcbiAgICBpZiAoaXNPdXRwdXRDb25maWdBcnJheShjb25maWcucGx1Z2lucykpIHtcbiAgICAgIGlmICghY29uZmlnLnBsdWdpbnMuaW5jbHVkZXMoJ3R5cGVzY3JpcHQnKSkgY29uZmlnLnBsdWdpbnMucHVzaCgndHlwZXNjcmlwdCcpO1xuICAgICAgaWYgKCFjb25maWcucGx1Z2lucy5pbmNsdWRlcygndHlwZXNjcmlwdC1vcGVyYXRpb25zJykpIGNvbmZpZy5wbHVnaW5zLnB1c2goJ3R5cGVzY3JpcHQtb3BlcmF0aW9ucycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWcucGx1Z2lucyA9IFtjb25maWcucGx1Z2luc10uY29uY2F0KGRlZmF1bHRQbHVnaW5zKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgXCJnZW5lcmF0ZXNcIiBjb25maWchYCk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDb2RlZ2VuKGNvbmZpZzogQ3VzdG9tQ29uZmlnKTogUHJvbWlzZTxUeXBlcy5GaWxlT3V0cHV0W10+IHtcbiAgZnVuY3Rpb24gd3JhcFRhc2sodGFzazogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4sIHNvdXJjZT86IHN0cmluZykge1xuICAgIHJldHVybiBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRhc2soKSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoc291cmNlICYmICEoZXJyb3IgaW5zdGFuY2VvZiBHcmFwaFFMRXJyb3IpKSB7XG4gICAgICAgICAgZXJyb3Iuc291cmNlID0gc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdDogVHlwZXMuRmlsZU91dHB1dFtdID0gW107XG4gIGNvbnN0IGNvbW1vbkxpc3RyT3B0aW9ucyA9IHtcbiAgICBleGl0T25FcnJvcjogdHJ1ZSxcbiAgfTtcbiAgbGV0IGxpc3RyOiBMaXN0cjtcblxuICBpZiAocHJvY2Vzcy5lbnYuVkVSQk9TRSkge1xuICAgIGxpc3RyID0gbmV3IExpc3RyKHtcbiAgICAgIC4uLmNvbW1vbkxpc3RyT3B0aW9ucyxcbiAgICAgIHJlbmRlcmVyOiAndmVyYm9zZScsXG4gICAgICBub25UVFlSZW5kZXJlcjogJ3ZlcmJvc2UnLFxuICAgIH0pO1xuICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCcpIHtcbiAgICBsaXN0ciA9IG5ldyBMaXN0cih7XG4gICAgICAuLi5jb21tb25MaXN0ck9wdGlvbnMsXG4gICAgICByZW5kZXJlcjogJ3NpbGVudCcsXG4gICAgICBub25UVFlSZW5kZXJlcjogJ3NpbGVudCcsXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgbGlzdHIgPSBuZXcgTGlzdHIoe1xuICAgICAgLi4uY29tbW9uTGlzdHJPcHRpb25zLFxuICAgICAgcmVuZGVyZXI6IGNvbmZpZy5zaWxlbnQgPyAnc2lsZW50JyA6IFJlbmRlcmVyLFxuICAgICAgbm9uVFRZUmVuZGVyZXI6IGNvbmZpZy5zaWxlbnQgPyAnc2lsZW50JyA6ICdkZWZhdWx0JyxcbiAgICAgIGNvbGxhcHNlOiB0cnVlLFxuICAgICAgY2xlYXJPdXRwdXQ6IGZhbHNlLFxuICAgIH0gYXMgYW55KTtcbiAgfVxuXG4gIGxldCByb290Q29uZmlnOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIGxldCByb290U2NoZW1hczogKFR5cGVzLlNjaGVtYSB8IHVuZGVmaW5lZClbXTtcbiAgbGV0IHJvb3REb2N1bWVudHM6IChUeXBlcy5PcGVyYXRpb25Eb2N1bWVudCB8IHVuZGVmaW5lZClbXTtcbiAgbGV0IGdlbmVyYXRlczogeyBbZmlsZW5hbWU6IHN0cmluZ106IFR5cGVzLkNvbmZpZ3VyZWRPdXRwdXQgfSA9IHt9O1xuXG4gIGFzeW5jIGZ1bmN0aW9uIG5vcm1hbGl6ZSgpIHtcbiAgICAvKiBMb2FkIFJlcXVpcmUgZXh0ZW5zaW9ucyAqL1xuICAgIGNvbnN0IHJlcXVpcmVFeHRlbnNpb25zID0gbm9ybWFsaXplSW5zdGFuY2VPckFycmF5PHN0cmluZyB8IHVuZGVmaW5lZD4oY29uZmlnLnJlcXVpcmUpO1xuICAgIGZvciAoY29uc3QgbW9kIG9mIHJlcXVpcmVFeHRlbnNpb25zKSB7XG4gICAgICBtb2QgJiYgKGF3YWl0IGltcG9ydChtb2QpKTtcbiAgICB9XG5cbiAgICAvKiBSb290IHRlbXBsYXRlcy1jb25maWcgKi9cbiAgICByb290Q29uZmlnID0gY29uZmlnLmNvbmZpZyB8fCB7fTtcblxuICAgIC8qIE5vcm1hbGl6ZSByb290IFwic2NoZW1hXCIgZmllbGQgKi9cbiAgICByb290U2NoZW1hcyA9IG5vcm1hbGl6ZUluc3RhbmNlT3JBcnJheTxUeXBlcy5TY2hlbWEgfCB1bmRlZmluZWQ+KGNvbmZpZy5zY2hlbWEpO1xuXG4gICAgLyogTm9ybWFsaXplIHJvb3QgXCJkb2N1bWVudHNcIiBmaWVsZCAqL1xuICAgIHJvb3REb2N1bWVudHMgPSBub3JtYWxpemVJbnN0YW5jZU9yQXJyYXk8VHlwZXMuT3BlcmF0aW9uRG9jdW1lbnQgfCB1bmRlZmluZWQ+KGNvbmZpZy5kb2N1bWVudHMpO1xuXG4gICAgLyogTm9ybWFsaXplIFwiZ2VuZXJhdG9yc1wiIGZpZWxkICovXG4gICAgY29uc3QgZ2VuZXJhdGVLZXlzID0gT2JqZWN0LmtleXMoY29uZmlnLmdlbmVyYXRlcyk7XG5cbiAgICBpZiAoZ2VuZXJhdGVLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IERldGFpbGVkRXJyb3IoXG4gICAgICAgICdJbnZhbGlkIENvZGVnZW4gQ29uZmlndXJhdGlvbiEnLFxuICAgICAgICBgXG4gICAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB5b3VyIGNvZGVnZW4gY29uZmlnIGZpbGUgY29udGFpbnMgdGhlIFwiZ2VuZXJhdGVzXCIgZmllbGQsIHdpdGggYSBzcGVjaWZpY2F0aW9uIGZvciB0aGUgcGx1Z2lucyB5b3UgbmVlZC5cblxuICAgICAgICBJdCBzaG91bGQgbG9va3MgbGlrZSB0aGF0OlxuXG4gICAgICAgIGdlbmVyYXRlczpcbiAgICAgICAgICBteS1maWxlLnRzOlxuICAgICAgICAgICAgLSBwbHVnaW4xXG4gICAgICAgICAgICAtIHBsdWdpbjJcbiAgICAgICAgICAgIC0gcGx1Z2luM1xuICAgICAgICBgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGZpbGVuYW1lIG9mIGdlbmVyYXRlS2V5cykge1xuICAgICAgZ2VuZXJhdGVzW2ZpbGVuYW1lXSA9IG5vcm1hbGl6ZU91dHB1dFBhcmFtKGNvbmZpZy5nZW5lcmF0ZXNbZmlsZW5hbWVdKTtcbiAgICB9XG4gIH1cblxuICBsaXN0ci5hZGQoe1xuICAgIHRpdGxlOiAnUGFyc2UgY29uZmlndXJhdGlvbicsXG4gICAgdGFzazogKCkgPT4gbm9ybWFsaXplKCksXG4gIH0pO1xuXG4gIGxpc3RyLmFkZCh7XG4gICAgdGl0bGU6ICdHZW5lcmF0ZSBvdXRwdXRzJyxcbiAgICB0YXNrOiAoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IExpc3RyKFxuICAgICAgICBPYmplY3Qua2V5cyhnZW5lcmF0ZXMpLm1hcDxMaXN0ci5MaXN0clRhc2s+KChmaWxlbmFtZSwgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG91dHB1dENvbmZpZyA9IGdlbmVyYXRlc1tmaWxlbmFtZV07XG4gICAgICAgICAgY29uc3QgaGFzUHJlc2V0ID0gISFvdXRwdXRDb25maWcucHJlc2V0O1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpdGxlOiBoYXNQcmVzZXRcbiAgICAgICAgICAgICAgPyBgR2VuZXJhdGUgdG8gJHtmaWxlbmFtZX0gKHVzaW5nIEVYUEVSSU1FTlRBTCBwcmVzZXQgXCIke291dHB1dENvbmZpZy5wcmVzZXR9XCIpYFxuICAgICAgICAgICAgICA6IGBHZW5lcmF0ZSAke2ZpbGVuYW1lfWAsXG4gICAgICAgICAgICB0YXNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG91dHB1dEZpbGVUZW1wbGF0ZUNvbmZpZyA9IG91dHB1dENvbmZpZy5jb25maWcgfHwge307XG4gICAgICAgICAgICAgIGNvbnN0IG91dHB1dERvY3VtZW50czogVHlwZXMuRG9jdW1lbnRGaWxlW10gPSBbXTtcbiAgICAgICAgICAgICAgbGV0IG91dHB1dFNjaGVtYTogRG9jdW1lbnROb2RlO1xuICAgICAgICAgICAgICBjb25zdCBvdXRwdXRTcGVjaWZpY1NjaGVtYXMgPSBub3JtYWxpemVJbnN0YW5jZU9yQXJyYXk8VHlwZXMuU2NoZW1hIHwgdW5kZWZpbmVkPihvdXRwdXRDb25maWcuc2NoZW1hKTtcbiAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0U3BlY2lmaWNEb2N1bWVudHMgPSBub3JtYWxpemVJbnN0YW5jZU9yQXJyYXk8VHlwZXMuT3BlcmF0aW9uRG9jdW1lbnQgfCB1bmRlZmluZWQ+KFxuICAgICAgICAgICAgICAgIG91dHB1dENvbmZpZy5kb2N1bWVudHMsXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMaXN0cihcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnTG9hZCBHcmFwaFFMIHNjaGVtYXMnLFxuICAgICAgICAgICAgICAgICAgICB0YXNrOiB3cmFwVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVidWdMb2coYFtDTEldIExvYWRpbmcgU2NoZW1hc2ApO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsbFNjaGVtYXMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5yb290U2NoZW1hcy5tYXAocG9pbnRUb1NjaGVtYSA9PiAocG9pbnRUb1NjaGVtYSA/IGxvYWRTY2hlbWEocG9pbnRUb1NjaGVtYSwgY29uZmlnKSA6IG51bGwpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLm91dHB1dFNwZWNpZmljU2NoZW1hcy5tYXAocG9pbnRUb1NjaGVtYSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludFRvU2NoZW1hID8gbG9hZFNjaGVtYShwb2ludFRvU2NoZW1hLCBjb25maWcpIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkU2NoZW1hID0gYWxsU2NoZW1hcy5maWx0ZXIoYSA9PiBhKSBhcyBQcm9taXNlPERvY3VtZW50Tm9kZT5bXTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWxpZFNjaGVtYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRTY2hlbWEgPSBtZXJnZVNjaGVtYXMoW2NvbmZpZy5kZWZhdWx0U2NoZW1hLCAuLi4oYXdhaXQgUHJvbWlzZS5hbGwodmFsaWRTY2hlbWEpKV0pO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZmlsZW5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdMb2FkIEdyYXBoUUwgZG9jdW1lbnRzJyxcbiAgICAgICAgICAgICAgICAgICAgdGFzazogd3JhcFRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGRlYnVnTG9nKGBbQ0xJXSBMb2FkaW5nIERvY3VtZW50c2ApO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsbERvY3VtZW50cyA9IFsuLi5yb290RG9jdW1lbnRzLCAuLi5vdXRwdXRTcGVjaWZpY0RvY3VtZW50c10gYXMgVHlwZXMuSW5zdGFuY2VPckFycmF5PFxuICAgICAgICAgICAgICAgICAgICAgICAgVHlwZXMuT3BlcmF0aW9uRG9jdW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICA+O1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50cyA9IGF3YWl0IGxvYWREb2N1bWVudHMoYWxsRG9jdW1lbnRzLCBjb25maWcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXREb2N1bWVudHMucHVzaCguLi5kb2N1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgZmlsZW5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdHZW5lcmF0ZScsXG4gICAgICAgICAgICAgICAgICAgIHRhc2s6IHdyYXBUYXNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0xvZyhgW0NMSV0gR2VuZXJhdGluZyBvdXRwdXRgKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkUGx1Z2luc0FycmF5ID0gbm9ybWFsaXplQ29uZmlnKG91dHB1dENvbmZpZy5wbHVnaW5zKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbHVnaW5Mb2FkZXIgPSBjb25maWcucGx1Z2luTG9hZGVyIHx8IGRlZmF1bHRMb2FkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGx1Z2luUGFja2FnZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRQbHVnaW5zQXJyYXkubWFwKHBsdWdpbiA9PiBnZXRQbHVnaW5CeU5hbWUoT2JqZWN0LmtleXMocGx1Z2luKVswXSwgcGx1Z2luTG9hZGVyKSksXG4gICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwbHVnaW5NYXA6IHsgW25hbWU6IHN0cmluZ106IENvZGVnZW5QbHVnaW4gfSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXNldDogVHlwZXMuT3V0cHV0UHJlc2V0IHwgbnVsbCA9IGhhc1ByZXNldFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0eXBlb2Ygb3V0cHV0Q29uZmlnLnByZXNldCA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCBnZXRQcmVzZXRCeU5hbWUob3V0cHV0Q29uZmlnLnByZXNldCwgZGVmYXVsdExvYWRlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBvdXRwdXRDb25maWcucHJlc2V0IVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcGx1Z2luUGFja2FnZXMuZm9yRWFjaCgocGx1Z2luUGFja2FnZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGx1Z2luID0gbm9ybWFsaXplZFBsdWdpbnNBcnJheVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBPYmplY3Qua2V5cyhwbHVnaW4pWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5NYXBbbmFtZV0gPSBwbHVnaW5QYWNrYWdlO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVyZ2VkQ29uZmlnID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucm9vdENvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLih0eXBlb2Ygb3V0cHV0RmlsZVRlbXBsYXRlQ29uZmlnID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICA/IHsgdmFsdWU6IG91dHB1dEZpbGVUZW1wbGF0ZUNvbmZpZyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogb3V0cHV0RmlsZVRlbXBsYXRlQ29uZmlnKSxcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgbGV0IG91dHB1dHM6IFR5cGVzLkdlbmVyYXRlT3B0aW9uc1tdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVpbHRTY2hlbWEgPSB0cnlUb0J1aWxkU2NoZW1hKG91dHB1dFNjaGVtYSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzUHJlc2V0ICYmIHByZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0cyA9IGF3YWl0IHByZXNldC5idWlsZEdlbmVyYXRlc1NlY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlT3V0cHV0RGlyOiBmaWxlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2V0Q29uZmlnOiBvdXRwdXRDb25maWcucHJlc2V0Q29uZmlnIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiBub3JtYWxpemVkUGx1Z2luc0FycmF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWE6IG91dHB1dFNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hQXN0OiBidWlsdFNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnRzOiBvdXRwdXREb2N1bWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogbWVyZ2VkQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5NYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6IG5vcm1hbGl6ZWRQbHVnaW5zQXJyYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hOiBvdXRwdXRTY2hlbWEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hQXN0OiBidWlsdFNjaGVtYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudHM6IG91dHB1dERvY3VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IG1lcmdlZENvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5NYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2Nlc3MgPSBhc3luYyAob3V0cHV0QXJnczogVHlwZXMuR2VuZXJhdGVPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCBjb2RlZ2VuKG91dHB1dEFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogb3V0cHV0QXJncy5maWxlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogb3V0cHV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBob29rczogb3V0cHV0Q29uZmlnLmhvb2tzIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKG91dHB1dHMubWFwKHByb2Nlc3MpKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZmlsZW5hbWUpLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIC8vIGl0IHN0b3BzIHdoZW4gb25lIG9mIHRhc2tzIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgZXhpdE9uRXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIHtcbiAgICAgICAgICAvLyBpdCBkb2Vzbid0IHN0b3Agd2hlbiBvbmUgb2YgdGFza3MgZmFpbGVkLCB0byBmaW5pc2ggYXQgbGVhc3Qgc29tZSBvZiBvdXRwdXRzXG4gICAgICAgICAgZXhpdE9uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgIC8vIHJ1biA0IGF0IG9uY2VcbiAgICAgICAgICBjb25jdXJyZW50OiA0LFxuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9LFxuICB9KTtcblxuICBhd2FpdCBsaXN0ci5ydW4oKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19