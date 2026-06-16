import { Module } from '@nestjs/common';
import { WorkerPool } from './worker-pool';
import { RealWorkerGateway } from './real-worker.gateway';
import { WorkerGateway } from '@/domain/application/shared/gateways/worker.gateway';
import { EnvModule } from '../env/env.module';

/**
 * WorkerModule - Módulo responsável pela orquestração de workers
 * Fornece o WorkerPool como provider para uso em toda a aplicação
 * Integra o RealWorkerGateway para processamento de transações
 */
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: WorkerGateway,
      useClass: RealWorkerGateway,
    },
    WorkerPool,
  ],
  exports: [WorkerPool, WorkerGateway],
})
export class WorkerModule {}
