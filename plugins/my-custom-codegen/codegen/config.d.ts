import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode } from 'graphql';
export interface CustomConfig extends Types.Config {
    defaultSchema: DocumentNode;
}
export declare function loadConfig(configFilePath?: string): Promise<{
    config: Types.Config;
    filepath: string;
}> | never;
interface ConfigOption {
    defaultSchema: DocumentNode;
    configPath?: string;
}
export declare function createConfig({ configPath, defaultSchema }: ConfigOption): Promise<CustomConfig | never>;
export {};
