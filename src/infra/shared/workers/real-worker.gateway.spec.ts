import { describe, it, expect, beforeEach } from 'vitest';
import { RealWorkerGateway } from '@/infra/shared/workers/real-worker.gateway';
import { FakeAuthorizer } from 'test/gateways/authorizer/fake-authorizer';
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { makeTransaction } from 'test/factories/make-transaction';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';
import { TransactionsRepository } from '@/domain/application/transaction/repositories/transactions.repository';

/**
 * Testes para o RealWorkerGateway
 * Valida a implementação real que coordena com Authorizer e Repository
 */
describe('RealWorkerGateway', () => {
  let realWorker: RealWorkerGateway;
  let fakeAuthorizer: FakeAuthorizer;
  let inMemoryRepository: InMemoryTransactionsRepository;

  beforeEach(() => {
    fakeAuthorizer = new FakeAuthorizer();
    inMemoryRepository = new InMemoryTransactionsRepository();
    realWorker = new RealWorkerGateway(fakeAuthorizer, inMemoryRepository);
  });

  it('should process a transaction successfully', async () => {
    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await realWorker.process(task);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should save transaction in repository after successful authorization', async () => {
    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await realWorker.process(task);

    expect(result.success).toBe(true);
    const savedTransaction = inMemoryRepository.items.get(transaction.id.toString());
    expect(savedTransaction).toBeDefined();
    expect(savedTransaction?.status).toBe(PAYMENT_STATUS.APPROVED);
  });

  it('should set authorize_id from authorizer response', async () => {
    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await realWorker.process(task);

    expect(result.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any)?.authorizeId).toBeDefined();
    const savedTransaction = inMemoryRepository.items.get(transaction.id.toString());
    expect(savedTransaction?.authorize_id).toBeDefined();
  });

  it('should reject transaction when authorizer rejects', async () => {
    fakeAuthorizer.isAuthorized = false;

    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await realWorker.process(task);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Authorization failed');
    const savedTransaction = inMemoryRepository.items.get(transaction.id.toString());
    expect(savedTransaction?.status).toBe(PAYMENT_STATUS.REJECTED);
  });

  it('should return transaction data with correct status', async () => {
    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await realWorker.process(task);

    expect(result.success).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any)?.transactionId).toBe(transaction.id.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any)?.status).toBe(PAYMENT_STATUS.APPROVED);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any)?.processedAt).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Simula erro forçando um cenário de falha
    // Por exemplo, removendo o repositório temporariamente

    const brokenWorker = new RealWorkerGateway(
      fakeAuthorizer,
      null as unknown as TransactionsRepository,
    );

    const transaction = makeTransaction({});
    const task = {
      transaction,
      retries: 0,
    };

    const result = await brokenWorker.process(task);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
