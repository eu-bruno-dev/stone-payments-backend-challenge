import { TransactionErrorMessages } from '@/core/consts/transaction';
import { ValueObject } from '@/core/entities/value-object';

export interface TimestampProps {
  value: Date;
}
export class Timestamp extends ValueObject<TimestampProps> {
  get value() {
    return this.props.value;
  }

  private static validateTimestamp(timestamp: Date) {
    if (!timestamp) {
      // Refatorar para erro específico
      throw new Error(TransactionErrorMessages.PAYLOAD_ERROR);
    }

    if (isNaN(timestamp.getTime())) {
      throw new Error(TransactionErrorMessages.TIMESTAMP_NOT_VALID);
    }

    const now = new Date();
    if (timestamp > now) {
      throw new Error(TransactionErrorMessages.TIMESTAMP_ON_FUTURE);
    }
  }

  static createTimestamp(date: Date) {
    Timestamp.validateTimestamp(date);
    return new Timestamp({
      value: date,
    });
  }
}
