import { DynamicModule, Module, Type } from '@nestjs/common';
import {
  WorkerGateway,
  WorkerPool as WorkerPoolContract,
} from '@/domain/application/shared/gateways/worker.gateway';
import { WorkerPool } from '@/infra/shared/workers/worker-pool';
import { EnvModule } from '../env/env.module';

/**
 * WorkerModuleOptions - Opções de configuração do módulo de workers
 * Permite injetar diferentes implementações de WorkerGateway
 */
interface WorkerModuleOptions {
  workerGatewayProvider: Type<WorkerGateway>;
}

/**
 * ConfigurableWorkerModule - Módulo configurável de workers
 * Pode ser usado para injetar diferentes implementações de WorkerGateway
 * dependendo do ambiente (testes, produção, etc)
 */
@Module({})
export class ConfigurableWorkerModule {
  static forRoot(options: WorkerModuleOptions): DynamicModule {
    return {
      module: ConfigurableWorkerModule,
      imports: [EnvModule],
      providers: [
        {
          provide: WorkerGateway,
          useClass: options.workerGatewayProvider,
        },
        WorkerPool,
        {
          provide: WorkerPoolContract,
          useExisting: WorkerPool,
        },
      ],
      exports: [WorkerPool, WorkerGateway, WorkerPoolContract],
    };
  }
}
