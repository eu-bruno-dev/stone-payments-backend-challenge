import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class Authorizer {
  abstract authorize(transaction: Transaction): Promise<{ authorize_id: string } | null>;
}
