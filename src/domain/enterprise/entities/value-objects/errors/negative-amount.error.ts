import { EntityError } from '@/core/errors/entity.error';

export class NegativeAmountError extends Error implements EntityError {
  constructor() {
    super('A quantidade deve ser positiva');
  }
}
