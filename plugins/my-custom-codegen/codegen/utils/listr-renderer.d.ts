import { ListrTask } from 'listr';
import { DetailedError } from '@graphql-codegen/core';
export declare class Renderer {
    private updateRenderer;
    constructor(tasks: ListrTask, options: any);
    render(): any;
    end(err: Error & {
        errors?: (Error | DetailedError)[];
        details?: string;
    }): void;
}
