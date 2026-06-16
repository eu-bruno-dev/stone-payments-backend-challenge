import { Injectable } from '@nestjs/common';
import { MakeTransactionUseCase } from './use-cases/make-transaction-use-case';
import { WorkerPool } from '@/infra/shared/workers/worker-pool';
import { WorkerTask } from '@/domain/application/shared/gateways/worker.gateway';
import { Transaction } from '@/domain/enterprise/entities/transaction';

/**
 * TransactionService - Serviço de aplicação para gerenciar transações
 * Responsável por orquestrar o processamento através do WorkerPool
 * Segue padrão de Use Cases e injeta dependências
 */
@Injectable()
export class TransactionService {
  constructor(
    private readonly makeTransactionUseCase: MakeTransactionUseCase,
    private readonly workerPool: WorkerPool,
  ) {}

  /**
   * Processa uma transação através do pool de workers
   */
  async processTransaction(params: Parameters<typeof this.makeTransactionUseCase.execute>[0]) {
    return this.makeTransactionUseCase.execute(params);
  }

  /**
   * Enfileira uma transação para processamento concorrente
   */
  async enqueueTransaction(transaction: Transaction) {
    const task: WorkerTask = {
      transaction,
      retries: 0,
    };

    return this.workerPool.enqueue(task);
  }

  /**
   * Retorna o tamanho atual da fila de processamento
   */
  getQueueStatus() {
    return {
      queueSize: this.workerPool.getQueueSize(),
      activeWorkers: this.workerPool.getActiveWorkers(),
    };
  }
}
