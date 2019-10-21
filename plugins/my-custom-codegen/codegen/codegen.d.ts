import { Types } from '@graphql-codegen/plugin-helpers';
import { CustomConfig } from './config';
export declare const defaultLoader: (mod: string) => Promise<any>;
export declare function isConfiguredOutput(type: any): type is Types.ConfiguredOutput;
export declare function normalizeOutputParam(config: Types.OutputConfig | Types.ConfiguredOutput): Types.ConfiguredOutput;
export declare function executeCodegen(config: CustomConfig): Promise<Types.FileOutput[]>;
