import { join } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { normalizeInstanceOrArray, normalizeOutputParam } from '@graphql-codegen/plugin-helpers';
import isValidPath from 'is-valid-path';
import isGlob from 'is-glob';
import debounce from 'debounce';
import logSymbols from 'log-symbols';
import { FSWatcher } from 'chokidar';

import { debugLog } from './debugging';
import { getLogger } from './logger';
import { executeCodegen } from '../codegen';
import { lifecycleHooks } from '../hooks';
import { loadConfig, CustomConfig } from '../config';

function log(msg: string) {
  // double spaces to inline the message with Listr
  getLogger().info(`  ${msg}`);
}

function emitWatching() {
  log(`${logSymbols.info} Watching for changes...`);
}

export const createWatcher = (
  initialConfig: CustomConfig,
  onNext: (result: Types.FileOutput[]) => Promise<Types.FileOutput[]>,
) => {
  debugLog(`[Watcher] Starting watcher...`);
  let config: CustomConfig = initialConfig;
  const files = [initialConfig.configFilePath].filter(a => a) as string[];
  const documents = normalizeInstanceOrArray<Types.OperationDocument | undefined>(config.documents);
  const schemas = normalizeInstanceOrArray<Types.Schema | undefined>(config.schema);

  // Add schemas and documents from "generates"
  Object.keys(config.generates)
    .map(filename => normalizeOutputParam(config.generates[filename]))
    .forEach(conf => {
      schemas.push(...normalizeInstanceOrArray<Types.Schema | undefined>(conf.schema));
      documents.push(...normalizeInstanceOrArray<Types.OperationDocument | undefined>(conf.documents));
    });

  if (documents) {
    documents.forEach(doc => {
      if (typeof doc === 'string') {
        files.push(doc);
      } else {
        files.push(...Object.keys(doc!));
      }
    });
  }

  (schemas as string[]).forEach((schema: string) => {
    if (isGlob(schema) || isValidPath(schema)) {
      files.push(schema);
    }
  });

  if (typeof config.watch !== 'boolean') {
    files.push(...normalizeInstanceOrArray<string>(config.watch!));
  }

  let watcher: FSWatcher;

  const runWatcher = async () => {
    const chokidar = await import('chokidar');
    let isShutdown = false;

    const debouncedExec = debounce(() => {
      if (!isShutdown) {
        executeCodegen(config)
          .then(onNext, () => Promise.resolve())
          .then(() => emitWatching());
      }
    }, 100);
    emitWatching();

    const ignored: string[] = [];
    Object.keys(config.generates)
      .map(filename => ({ filename, config: normalizeOutputParam(config.generates[filename]) }))
      .forEach(entry => {
        if (entry.config.preset) {
          const extension = entry.config.presetConfig && entry.config.presetConfig.extension;
          if (extension) {
            ignored.push(join(entry.filename, '**', '*' + extension));
          }
        } else {
          ignored.push(entry.filename);
        }
      });

    watcher = chokidar.watch(files, {
      persistent: true,
      ignoreInitial: true,
      followSymlinks: true,
      cwd: process.cwd(),
      disableGlobbing: false,
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
      depth: 99,
      awaitWriteFinish: true,
      ignorePermissionErrors: false,
      atomic: true,
      ignored,
    });

    debugLog(`[Watcher] Started`);

    const shutdown = async () => {
      isShutdown = true;
      debugLog(`[Watcher] Shutting down`);
      log(`Shutting down watch...`);
      watcher.close();
      lifecycleHooks(config.hooks).beforeDone();
    };

    // it doesn't matter what has changed, need to run whole process anyway
    watcher.on('all', async (eventName, path) => {
      lifecycleHooks(config.hooks).onWatchTriggered(eventName, path);
      debugLog(`[Watcher] triggered due to a file ${eventName} event: ${path}`);
      const fullPath = join(process.cwd(), path);

      if (eventName === 'change' && config.configFilePath && fullPath === config.configFilePath) {
        log(`${logSymbols.info} Config file has changed, reloading...`);
        const configSearchResult = await loadConfig(config.configFilePath);

        const newParsedConfig = configSearchResult.config as CustomConfig;
        newParsedConfig.watch = config.watch;
        newParsedConfig.silent = config.silent;
        newParsedConfig.overwrite = config.overwrite;
        newParsedConfig.configFilePath = config.configFilePath;
        config = newParsedConfig;
      }

      debouncedExec();
    });

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  };

  // the promise never resolves to keep process running
  return new Promise((_, reject) => {
    executeCodegen(config)
      .then(onNext, () => Promise.resolve())
      .then(runWatcher)
      .catch(err => {
        watcher.close();
        reject(err);
      });
  });
};
