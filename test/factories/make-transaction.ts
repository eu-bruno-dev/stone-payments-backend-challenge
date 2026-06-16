import { faker } from '@faker-js/faker/locale/pt_BR';

import { ID } from '@/core/entities/id';
import { PrimitiveOf } from '@/core/types/primitive-of';
import { Transaction, TransactionProps } from '@/domain/enterprise/entities/transaction';
import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { Timestamp } from '@/domain/enterprise/entities/value-objects/timestamp';
import { CreditCard } from '@/domain/enterprise/entities/value-objects/credit-card';

type MakeTransactionProps = {
  [K in keyof TransactionProps]?: PrimitiveOf<TransactionProps[K]>;
};

export function makeTransaction(props: MakeTransactionProps = {}, id?: ID) {
  return Transaction.create(
    {
      card_number: CreditCard.createCreditCard(
        props.card_number ?? faker.finance.creditCardNumber(),
      ),
      amount: props.amount ?? faker.number.float({ fractionDigits: 2, min: 1, max: 3000 }),
      currency: props.currency ?? CURRENCY_OPTIONS.BRL,
      merchant: props.merchant ?? faker.company.name(),
      timestamp: Timestamp.createTimestamp(props.timestamp ?? new Date()),
    },
    id,
  );
}
