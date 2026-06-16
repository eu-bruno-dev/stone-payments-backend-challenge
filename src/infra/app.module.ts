import { Module } from '@nestjs/common';
import { EnvModule } from './shared/env/env.module';
import { WorkerModule } from './shared/workers/worker.module';
import { TransactionModule } from '@/domain/application/transaction/transaction.module';

@Module({
  imports: [EnvModule, WorkerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
