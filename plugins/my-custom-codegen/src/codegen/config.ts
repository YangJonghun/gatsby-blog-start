import cosmiconfig from 'cosmiconfig';
import { resolve } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { DetailedError } from '@graphql-codegen/core';
import { isOutputConfigArray } from '@graphql-codegen/plugin-helpers';
import { DocumentNode } from 'graphql';

export interface CustomConfig extends Types.Config {
  defaultSchema: DocumentNode;
}

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'yaml', 'yml', 'js', 'config.js'];
  // gives codegen.json...
  const regular = extensions.map(ext => `${moduleName}.${ext}`);
  // gives .codegenrc.json... but no .codegenrc.config.js
  const dot = extensions.filter(ext => ext !== 'config.js').map(ext => `.${moduleName}rc.${ext}`);

  return regular.concat(dot);
}

function customLoader(ext: 'json' | 'yaml' | 'js') {
  function loader(filepath: string, content: string) {
    if (typeof process !== 'undefined' && 'env' in process) {
      content = content.replace(/\$\{(.*)\}/g, (_str, variable) => {
        let varName = variable;
        let defaultValue = '';

        if (variable.includes(':')) {
          const spl = variable.split(':');
          varName = spl.shift();
          defaultValue = spl.join(':');
        }

        return process.env[varName] || defaultValue;
      });
    }

    if (ext === 'json') {
      return (cosmiconfig as any).loadJson(filepath, content);
    }

    if (ext === 'yaml') {
      return (cosmiconfig as any).loadYaml(filepath, content);
    }

    if (ext === 'js') {
      return (cosmiconfig as any).loadJs(filepath, content);
    }
  }

  return {
    sync: loader,
    async: loader,
  };
}

export async function loadConfig(
  configFilePath?: string,
):
  | Promise<{
      config: Types.Config;
      filepath: string;
    }>
  | never {
  const moduleName = 'codegen';
  const cosmi = cosmiconfig(moduleName, {
    searchPlaces: generateSearchPlaces(moduleName),
    loaders: {
      '.json': customLoader('json'),
      '.yaml': customLoader('yaml'),
      '.yml': customLoader('yaml'),
      '.js': customLoader('js'),
      noExt: customLoader('yaml'),
    },
  });
  const result = await (configFilePath ? cosmi.load(configFilePath) : cosmi.search(process.cwd()));

  if (!result) {
    if (configFilePath) {
      throw new DetailedError(
        `Config ${configFilePath} does not exist`,
        `
        Config ${configFilePath} does not exist.
  
          $ graphql-codegen --config ${configFilePath}
  
        Please make sure the --config points to a correct file.
      `,
      );
    }

    throw new DetailedError(
      `Unable to find Codegen config file!`,
      `
        Please make sure that you have a configuration file under the current directory! 
      `,
    );
  }

  if (result.isEmpty) {
    throw new DetailedError(
      `Found Codegen config file but it was empty!`,
      `
        Please make sure that you have a valid configuration file under the current directory!
      `,
    );
  }

  return {
    filepath: result.filepath,
    config: result.config as Types.Config,
  };
}

interface ConfigOption {
  defaultSchema: DocumentNode;
  configPath?: string;
}

export async function createConfig({ configPath, defaultSchema }: ConfigOption): Promise<CustomConfig | never> {
  const customConfigPath = configPath ? resolve(process.cwd(), configPath) : undefined;
  const configSearchResult = await loadConfig(customConfigPath);
  const parsedConfigFile = configSearchResult.config as CustomConfig;

  parsedConfigFile.configFilePath = configSearchResult.filepath;
  parsedConfigFile.defaultSchema = defaultSchema;

  return parsedConfigFile;
}
