import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class SuspiciousRepository {
  abstract register(transaction: Transaction): Promise<void>;
}
