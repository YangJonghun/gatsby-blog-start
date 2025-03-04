import { Types } from '@graphql-codegen/plugin-helpers';
import { sync as mkdirpSync } from 'mkdirp';
import { dirname } from 'path';
import { createHash } from 'crypto';

import { lifecycleHooks } from './hooks';
import { executeCodegen } from './codegen';
import { createWatcher } from './utils/watcher';
import { fileExists, readSync, writeSync } from './utils/file-system';
import { debugLog } from './utils/debugging';
import { DocumentNode } from 'graphql';
import { CustomConfig } from './config';

const hash = (content: string): string =>
  createHash('sha1')
    .update(content)
    .digest('base64');

export async function generate(config: CustomConfig, saveToFile = true): Promise<Types.FileOutput[] | any> {
  await lifecycleHooks(config.hooks).afterStart();
  let recentOutputHash = new Map<string, string>();

  async function writeOutput(generationResult: Types.FileOutput[]) {
    if (!saveToFile) {
      return generationResult;
    }

    await lifecycleHooks(config.hooks).beforeAllFileWrite(generationResult.map(r => r.filename));

    await Promise.all(
      generationResult.map(async (result: Types.FileOutput) => {
        const exists = fileExists(result.filename);

        if (!shouldOverwrite(config, result.filename) && exists) {
          return;
        }

        const content = result.content || '';
        const currentHash = hash(content);
        let previousHash = recentOutputHash.get(result.filename);

        if (!previousHash && exists) {
          previousHash = hash(readSync(result.filename));
        }

        if (previousHash && currentHash === previousHash) {
          debugLog(`Skipping file (${result.filename}) writing due to indentical hash...`);

          return;
        }

        if (content.length === 0) {
          return;
        }

        recentOutputHash.set(result.filename, currentHash);
        const basedir = dirname(result.filename);
        await lifecycleHooks(result.hooks).beforeOneFileWrite(result.filename);
        await lifecycleHooks(config.hooks).beforeOneFileWrite(result.filename);
        mkdirpSync(basedir);
        writeSync(result.filename, result.content);
        await lifecycleHooks(result.hooks).afterOneFileWrite(result.filename);
        await lifecycleHooks(config.hooks).afterOneFileWrite(result.filename);
      }),
    );

    await lifecycleHooks(config.hooks).afterAllFileWrite(generationResult.map(r => r.filename));

    return generationResult;
  }

  // watch mode
  if (config.watch) {
    return createWatcher(config, writeOutput);
  }

  const outputFiles = await executeCodegen(config);

  await writeOutput(outputFiles);

  lifecycleHooks(config.hooks).beforeDone();

  return outputFiles;
}

function shouldOverwrite(config: CustomConfig, outputPath: string): boolean {
  const globalValue = config.overwrite === undefined ? true : !!config.overwrite;
  const outputConfig = config.generates[outputPath];

  if (!outputConfig) {
    debugLog(`Couldn't find a config of ${outputPath}`);
    return globalValue;
  }

  if (isConfiguredOutput(outputConfig) && typeof outputConfig.overwrite === 'boolean') {
    return outputConfig.overwrite;
  }

  return globalValue;
}

function isConfiguredOutput(output: any): output is Types.ConfiguredOutput {
  return typeof output.plugins !== 'undefined';
}
