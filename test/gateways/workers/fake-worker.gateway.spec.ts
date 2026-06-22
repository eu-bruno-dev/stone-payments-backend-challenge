import { describe, it, expect, beforeEach } from 'vitest';
import { FakeWorkerGateway } from 'test/gateways/workers/fake-worker.gateway';
import { makeTransaction } from 'test/factories/make-transaction';
import { WorkerTask } from '@/domain/application/shared/gateways/worker.gateway';

/**
 * Testes para o FakeWorkerGateway
 * Valida a implementação fake reutilizável
 */
describe('FakeWorkerGateway', () => {
  let fakeWorker: FakeWorkerGateway;

  beforeEach(() => {
    fakeWorker = new FakeWorkerGateway();
  });

  it('should process a task successfully', async () => {
    const transaction = makeTransaction({});
    const task: WorkerTask = {
      transaction,
      retries: 0,
    };

    const result = await fakeWorker.process(task);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should fail when shouldFail flag is set', async () => {
    fakeWorker.shouldFail = true;
    fakeWorker.failureMessage = 'Custom failure';

    const transaction = makeTransaction({});
    const task: WorkerTask = {
      transaction,
      retries: 0,
    };

    const result = await fakeWorker.process(task);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Custom failure');
  });

  it('should respect processDelay configuration', async () => {
    fakeWorker.processDelay = 100;

    const transaction = makeTransaction({});
    const task: WorkerTask = {
      transaction,
      retries: 0,
    };

    const startTime = Date.now();
    await fakeWorker.process(task);
    const duration = Date.now() - startTime;

    expect(duration).toBeGreaterThanOrEqual(95);
    expect(duration).toBeLessThan(200);
  });

  it('should return transaction id in result data', async () => {
    const transaction = makeTransaction({});
    const task: WorkerTask = {
      transaction,
      retries: 0,
    };

    const result = await fakeWorker.process(task);

    expect(result.data).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any).transactionId).toBe(transaction.id.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((result.data as any).processedAt).toBeDefined();
  });
});
