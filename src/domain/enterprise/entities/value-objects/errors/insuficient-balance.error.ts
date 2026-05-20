import { EntityError } from '@/core/errors/entity.error';

export class InsuficientBalanceError extends Error implements EntityError {
  constructor() {
    super('Saldo insuficiente');
  }
}
