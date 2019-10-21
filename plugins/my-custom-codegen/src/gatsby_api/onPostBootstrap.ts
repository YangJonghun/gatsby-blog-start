/* eslint @typescript-eslint/no-unused-vars: 0 */
/* eslint no-unused-vars: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */
/* eslint import/no-extraneous-dependencies: 0 */

import { ParentSpanPluginArgs, PluginCallback, PluginOptions } from 'gatsby';
import { DocumentNode } from 'graphql';

import { createConfig, generate } from '../codegen';
import { lifecycleHooks } from '../codegen/hooks';

const { parse, printSchema } = require('gatsby/graphql');

interface CustomPluginOptions extends PluginOptions {
  configPath?: string;
}

const onPostBootstrap = async (
  { store }: ParentSpanPluginArgs,
  { configPath }: CustomPluginOptions = { plugins: [] },
  callback?: PluginCallback,
) => {
  // // get the schema and load all graphql queries from pages
  const { schema } = store.getState();

  const parsedSchema: DocumentNode = parse(printSchema(schema));

  console.log(`===========================================`);
  const config = await createConfig({
    defaultSchema: parsedSchema,
    configPath,
  });

  try {
    await generate(config);
  } catch (error) {
    await lifecycleHooks(config.hooks).onError(error.toString());
    throw error;
  }

  console.log(`===========================================`);
  console.log('I will create a page!');
  console.log('Typescript!');

  // // tell gatsby we are done
  typeof callback === 'function' && callback(null);
};

export default onPostBootstrap;
