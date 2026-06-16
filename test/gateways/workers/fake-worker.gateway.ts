import {
  WorkerGateway,
  WorkerTask,
  WorkerResult,
} from '@/domain/application/shared/gateways/worker.gateway';

/**
 * FakeWorkerGateway - Implementação fake para testes
 * Reutiliza a estrutura de WorkerGateway para testes sem dependências externas
 */
export class FakeWorkerGateway implements WorkerGateway {
  public processDelay = 50; // ms
  public shouldFail = false;
  public failureMessage = 'Worker processing failed';

  async process(task: WorkerTask): Promise<WorkerResult> {
    // Simula processamento assíncrono
    await new Promise((resolve) => setTimeout(resolve, this.processDelay));

    if (this.shouldFail) {
      return {
        success: false,
        error: new Error(this.failureMessage),
      };
    }

    return {
      success: true,
      data: {
        transactionId: task.transaction.id.toString(),
        processedAt: new Date(),
      },
    };
  }
}
