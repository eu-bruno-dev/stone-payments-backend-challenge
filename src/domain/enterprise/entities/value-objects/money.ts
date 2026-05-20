import { ValueObject } from '@/core/entities/value-object';

import { DifferentCurrenciesError } from './errors/different-currencies.error';
import { InsuficientBalanceError } from './errors/insuficient-balance.error';
import { NegativeAmountError } from './errors/negative-amount.error';

export interface MoneyProps {
  amount: number;
  currency: string;
}
// TODO: adicionar método de formatação de valores entre centavos e reais
export class Money extends ValueObject<MoneyProps> {
  get amount() {
    return this.props.amount;
  }

  get currency() {
    return this.props.currency;
  }

  get formattedAmount() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.props.currency,
    }).format(this.props.amount);
  }

  public add(qty: Money): Money {
    if (this.props.currency !== qty.props.currency) {
      throw new DifferentCurrenciesError();
    }
    return new Money({
      amount: this.props.amount + qty.props.amount,
      currency: this.props.currency,
    });
  }

  public subtract(qty: Money): Money {
    if (this.props.currency !== qty.props.currency) {
      throw new DifferentCurrenciesError();
    }
    if (this.props.amount < qty.props.amount) {
      throw new InsuficientBalanceError();
    }
    return new Money({
      amount: this.props.amount - qty.props.amount,
      currency: this.props.currency,
    });
  }

  public isGreaterThan(qty: Money): boolean {
    return this.props.amount > qty.props.amount;
  }

  public isLessThan(qty: Money): boolean {
    return this.props.amount < qty.props.amount;
  }

  static createBRL(amount: number): Money {
    if (amount < 0) {
      throw new NegativeAmountError();
    }
    return new Money({ amount, currency: 'BRL' });
  }
}
