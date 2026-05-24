/* eslint-disable @typescript-eslint/require-await */
import { TransactionsRepository } from '@/domain/application/transaction/repositories/transactions.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items = new Map<string, Transaction>();

  async makeTransaction(transaction: Transaction): Promise<Transaction | null> {
    this.items.set(transaction.id.toString(), transaction);

    return transaction;
  }

  async findLast50SuspiciousByCardNumber(card_number: string): Promise<Transaction[]> {
    const transactions = Array.from(this.items.values()).filter(
      (transaction) => transaction.card_number.value === card_number,
    );

    return transactions.slice(0, 50);
  }
}
