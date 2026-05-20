import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class TransactionsRepository {
  abstract makeTransaction(transaction: Transaction): Promise<Transaction | null>;
}
