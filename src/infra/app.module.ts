import { Module } from '@nestjs/common';
import { EnvModule } from './shared/env/env.module';

@Module({
  imports: [EnvModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
