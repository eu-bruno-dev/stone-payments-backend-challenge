import { Injectable } from '@nestjs/common';
import {
  MakeTransactionUseCase,
  MakeTransactionUseCaseRequest,
} from './use-cases/make-transaction-use-case';
import {
  WorkerPool,
  WorkerTask,
  WorkerResult,
} from '@/domain/application/shared/gateways/worker.gateway';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Authorizer } from '@/domain/application/shared/gateways/authorizer.gateway';
import { TransactionsRepository } from './repositories/transactions.repository';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';

/**
 * TransactionService - Serviço de aplicação para gerenciar transações
 * Responsável por orquestrar o processamento através do WorkerPool
 * Segue padrão de Use Cases e injeta dependências
 */
@Injectable()
export class TransactionDomainService {
  constructor(
    private readonly makeTransactionUseCase: MakeTransactionUseCase,
    private readonly workerPool: WorkerPool,
    private readonly authorizer: Authorizer,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  /**
   * Processa uma transação através do pool de workers
   */
  async processTransaction(params: MakeTransactionUseCaseRequest) {
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

  async processExistingTransaction(transaction: Transaction): Promise<WorkerResult> {
    try {
      const authorizeResult = await this.authorizer.authorize(transaction);

      if (!authorizeResult) {
        transaction.changeStatus(PAYMENT_STATUS.REJECTED);
        await this.transactionsRepository.save(transaction);

        return { success: false, error: new Error('Authorization failed') };
      }

      transaction.setAuthorizeId(authorizeResult.authorize_id);
      transaction.changeStatus(PAYMENT_STATUS.APPROVED);

      const saved = await this.transactionsRepository.save(transaction);

      if (!saved) {
        return { success: false, error: new Error('Failed to persist transaction') };
      }

      return {
        success: true,
        data: {
          transactionId: saved.id.toString(),
          status: saved.status,
          authorizeId: saved.authorize_id,
          processedAt: new Date(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: new Error(message) };
    }
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
