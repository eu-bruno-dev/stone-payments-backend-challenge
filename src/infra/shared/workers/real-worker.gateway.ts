import { Injectable, Logger } from '@nestjs/common';
import {
  WorkerGateway,
  WorkerTask,
  WorkerResult,
} from '@/domain/application/shared/gateways/worker.gateway';
import { Authorizer } from '@/domain/application/shared/gateways/authorizer.gateway';
import { TransactionsRepository } from '@/domain/application/transaction/repositories/transactions.repository';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';

/**
 * RealWorkerGateway - Implementação real do WorkerGateway
 *
 * Responsabilidades:
 * - Processar tarefas de transação em workers
 * - Coordenar com Authorizer para autorização
 * - Coordenar com Repository para persistência
 * - Tratamento robusto de erros
 *
 * Princípios:
 * - Single Responsibility: Apenas processa tarefas
 * - Dependency Injection: Recebe dependências
 * - Error Handling: Captura e registra erros
 */
@Injectable()
export class RealWorkerGateway extends WorkerGateway {
  private readonly logger = new Logger(RealWorkerGateway.name);

  constructor(
    private readonly authorizer: Authorizer,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super();
  }

  async process(task: WorkerTask): Promise<WorkerResult> {
    try {
      const { transaction, retries } = task;

      this.logger.debug(`Processing transaction: ${transaction.id.toString()} (retry: ${retries})`);

      // 1. Autoriza a transação
      const authorizeResult = await this.authorizer.authorize(transaction);

      if (!authorizeResult) {
        this.logger.warn(`Transaction ${transaction.id.toString()} authorization failed`);
        transaction.changeStatus(PAYMENT_STATUS.REJECTED);
        await this.transactionsRepository.save(transaction);

        return {
          success: false,
          error: new Error('Authorization failed'),
        };
      }

      // 2. Define o ID de autorização
      transaction.setAuthorizeId(authorizeResult.authorize_id);

      // 3. Define o status como aprovado
      transaction.changeStatus(PAYMENT_STATUS.APPROVED);

      // 4. Persiste a transação autorizada
      const savedTransaction = await this.transactionsRepository.save(transaction);

      if (!savedTransaction) {
        this.logger.error(`Failed to save transaction: ${transaction.id.toString()}`);

        return {
          success: false,
          error: new Error('Failed to persist transaction'),
        };
      }

      this.logger.debug(`Transaction ${transaction.id.toString()} processed successfully`);

      return {
        success: true,
        data: {
          transactionId: savedTransaction.id.toString(),
          status: savedTransaction.status,
          authorizeId: savedTransaction.authorize_id,
          processedAt: new Date(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error processing transaction ${task.transaction.id.toString()}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (task.retries < 3) {
        return {
          success: false,
          error: new Error(`Failed after ${task.retries} retries: ${errorMessage}`),
        };
      }

      return {
        success: false,
        error: new Error(`Max retries exceeded: ${errorMessage}`),
      };
    }
  }
}
