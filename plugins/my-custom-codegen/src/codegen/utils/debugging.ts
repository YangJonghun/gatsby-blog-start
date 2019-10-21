import { getLogger } from './logger';

let queue: {
  message: string;
  meta?: any[];
}[] = [];

export function debugLog(message: string, ...meta: any[]) {
  if (!process.env.GQL_CODEGEN_NODEBUG && process.env.DEBUG !== undefined) {
    queue.push({
      message,
      meta,
    });
  }
}

export function resetLogs() {
  queue = [];
}

export function printLogs() {
  if (!process.env.GQL_CODEGEN_NODEBUG && process.env.DEBUG !== undefined) {
    queue.forEach(log => {
      getLogger().info(log.message, ...(log.meta ? [...log.meta] : []));
    });
    resetLogs();
  }
}
