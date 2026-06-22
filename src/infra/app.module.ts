import { Module } from '@nestjs/common';
import { EnvModule } from './shared/env/env.module';
import { WorkerModule } from './shared/workers/worker.module';
import { TransactionModule } from './modules/Transaction/transaction.module';

@Module({
  imports: [EnvModule, WorkerModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
