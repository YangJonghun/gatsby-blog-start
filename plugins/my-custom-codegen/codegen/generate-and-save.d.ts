import { Types } from '@graphql-codegen/plugin-helpers';
import { CustomConfig } from './config';
export declare function generate(config: CustomConfig, saveToFile?: boolean): Promise<Types.FileOutput[] | any>;
