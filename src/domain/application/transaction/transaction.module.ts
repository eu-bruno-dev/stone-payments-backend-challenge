import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { MakeTransactionUseCase } from './use-cases/make-transaction-use-case';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { TransactionsRepository } from './repositories/transactions.repository';
import { FakeAuthorizer } from 'test/gateways/authorizer/fake-authorizer';
import { Authorizer } from '../shared/gateways/authorizer.gateway';

/**
 * TransactionModule - Módulo de aplicação para transações
 * Fornece os use cases e serviços de transação
 * Integra com workers para processamento concorrente
 */
@Module({
  providers: [
    TransactionService,
    MakeTransactionUseCase,
    {
      provide: TransactionsRepository,
      useClass: InMemoryTransactionsRepository,
    },
    {
      provide: Authorizer,
      useClass: FakeAuthorizer,
    },
  ],
  exports: [TransactionService, MakeTransactionUseCase, TransactionsRepository, Authorizer],
})
export class TransactionModule {}
