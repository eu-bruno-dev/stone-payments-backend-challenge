import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class TransactionsRepository {
  abstract makeTransaction(transaction: Transaction): Promise<Transaction | null>;
  abstract findLast50SuspiciousByCardNumber(card_number: string): Promise<Transaction[]>;
  abstract flagCardAsSuspicious(card_number: string): Promise<void>;
  abstract isCardBlacklisted(card_number: string): Promise<boolean>;
}
