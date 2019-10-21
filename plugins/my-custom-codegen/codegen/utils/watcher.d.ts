import { Types } from '@graphql-codegen/plugin-helpers';
import { CustomConfig } from '../config';
export declare const createWatcher: (initialConfig: CustomConfig, onNext: (result: Types.FileOutput[]) => Promise<Types.FileOutput[]>) => Promise<unknown>;
