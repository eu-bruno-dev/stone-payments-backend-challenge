/* eslint-disable @typescript-eslint/require-await */
import { TransactionsRepository } from '@/domain/application/transaction/repositories/transactions.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items = new Map<string, Transaction>();

  async makeTransaction(transaction: Transaction): Promise<Transaction | null> {
    this.items.set(transaction.id.toString(), transaction);

    return transaction;
  }
}
