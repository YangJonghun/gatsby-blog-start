import { ParentSpanPluginArgs, PluginCallback, PluginOptions } from 'gatsby';
interface CustomPluginOptions extends PluginOptions {
    configPath?: string;
}
declare const onPostBootstrap: ({ store }: ParentSpanPluginArgs, { configPath }?: CustomPluginOptions, callback?: PluginCallback | undefined) => Promise<void>;
export default onPostBootstrap;
