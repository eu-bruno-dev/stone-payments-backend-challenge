import { Transaction } from '@/domain/enterprise/entities/transaction';

export interface WorkerTask {
  transaction: Transaction;
  retries: number;
}

export interface WorkerResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}

/**
 * WorkerGateway - Define o contrato para processamento de tarefas em workers
 * Segue o padrão de gateways do projeto
 */
export abstract class WorkerGateway {
  abstract process(task: WorkerTask): Promise<WorkerResult>;
}
