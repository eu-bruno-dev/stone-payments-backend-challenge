import { EntityError } from '@/core/errors/entity.error';

export class DifferentCurrenciesError extends Error implements EntityError {
  constructor() {
    super('As moedas são diferentes');
  }
}
