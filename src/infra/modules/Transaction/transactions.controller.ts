import { Controller, Post, Body, Get } from '@nestjs/common';
import { TransactionDomainService } from '../../../domain/application/transaction/transaction.domain-service';
import { type MakeTransactionUseCaseRequest } from '../../../domain/application/transaction/use-cases/make-transaction-use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionDomainService) {}

  @Post()
  async createTransaction(@Body() params: MakeTransactionUseCaseRequest) {
    return this.transactionService.processTransaction(params);
  }

  @Get('queue-status')
  getQueueStatus() {
    return this.transactionService.getQueueStatus();
  }
}

export default {};
