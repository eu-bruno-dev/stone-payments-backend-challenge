import { Module } from '@nestjs/common';
import { TransactionDomainService } from '../../../domain/application/transaction/transaction.domain-service';
import { MakeTransactionUseCase } from '../../../domain/application/transaction/use-cases/make-transaction-use-case';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { TransactionsRepository } from '../../../domain/application/transaction/repositories/transactions.repository';
import { FakeAuthorizer } from 'test/gateways/authorizer/fake-authorizer';
import { Authorizer } from '../../../domain/application/shared/gateways/authorizer.gateway';
import { TransactionsController } from './transactions.controller';

/**
 * TransactionModule - Módulo de aplicação para transações
 * Fornece os use cases e serviços de transação
 * Integra com workers para processamento concorrente
 */
@Module({
  providers: [
    TransactionDomainService,
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
  controllers: [TransactionsController],
  exports: [TransactionDomainService, MakeTransactionUseCase, TransactionsRepository, Authorizer],
})
export class TransactionModule {}
