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
    const rfc3339Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

    if (!timestamp) {
      // Refatorar para erro específico
      throw new Error(TransactionErrorMessages.PAYLOAD_ERROR);
    }

    if (typeof timestamp === 'string' && !rfc3339Regex.test(timestamp)) {
      throw new Error(TransactionErrorMessages.TIMESTAMP_NOT_VALID);
    }

    if (timestamp.getTime() > Date.now()) {
      throw new Error(TransactionErrorMessages.TIMESTAMP_ON_FUTURE);
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
