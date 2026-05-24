/* eslint-disable @typescript-eslint/require-await */
import { SuspiciousRepository } from '@/domain/application/transaction/repositories/suspicious.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemorySuspiciousRepository implements SuspiciousRepository {
  public items = new Map<string, Transaction>();

  async register(transaction: Transaction): Promise<void> {
    this.items.set(transaction.id.toString(), transaction);
  }

  async findLast50SuspiciousTransactionsByCardNumber(card_number: string): Promise<Transaction[]> {
    const transactions = Array.from(this.items.values()).filter(
      (transaction) => transaction.card_number.value === card_number,
    );

    return transactions.slice(0, 50);
  }
}
