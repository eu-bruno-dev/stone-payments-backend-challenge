import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';
import { BaseEntity } from '@/core/entities/base-entity';
import { ID } from '@/core/entities/id';
import { Optional } from '@/core/types/optional';
import { Timestamp } from './value-objects/timestamp';
import { CreditCard } from './value-objects/credit-card';

export interface TransactionProps {
  card_number: CreditCard;
  amount: number;
  currency: CURRENCY_OPTIONS;
  merchant: string;
  status: PAYMENT_STATUS;
  warning?: string;
  authorize_id?: string;
  timestamp: Timestamp;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Transaction extends BaseEntity<TransactionProps> {
  get card_number() {
    return this.props.card_number;
  }

  get amount() {
    return this.props.amount;
  }

  get currency() {
    return this.props.currency;
  }

  get merchant() {
    return this.props.merchant;
  }

  get authorize_id() {
    return this.props.authorize_id;
  }

  get status() {
    return this.props.status;
  }

  get warning() {
    return this.props.warning;
  }

  get timestamp() {
    return this.props.timestamp.value;
  }

  get created_at() {
    return this.props.createdAt;
  }

  get updated_at() {
    return this.props.updatedAt;
  }

  public setAuthorizeId(authorizeId: string) {
    this.props.authorize_id = authorizeId;
    this.props.updatedAt = new Date();
  }

  public changeStatus(status: PAYMENT_STATUS): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public setWarningText(text: string) {
    this.props.warning = text;
    this.props.updatedAt = new Date();
  }

  static create(props: Optional<TransactionProps, 'status' | 'createdAt'>, id?: ID) {
    // First validate input data
    this.validate(props);

    return new Transaction(
      {
        ...props,
        status: props.status ?? PAYMENT_STATUS.PENDING,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  private static validate(props: Optional<TransactionProps, 'status' | 'createdAt'>) {
    if (props.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    if (props.amount > 10_000 /* HARDCODED */) {
      props.status = PAYMENT_STATUS.HIGH_AMOUNT;
    }

    if (
      !props.card_number ||
      !props.amount ||
      !props.currency ||
      !props.merchant ||
      !props.timestamp
    ) {
      throw new Error('Missing required fields in payload');
    }

    if (!Object.values(CURRENCY_OPTIONS).includes(props.currency)) {
      throw new Error('Invalid currency');
    }
  }
}
