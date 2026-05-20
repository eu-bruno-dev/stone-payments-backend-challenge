import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CoreEnv } from '@/domain/application/shared/env/env';

import { Env } from './env.schema';

@Injectable()
export class EnvService implements CoreEnv<Env> {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  public get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
