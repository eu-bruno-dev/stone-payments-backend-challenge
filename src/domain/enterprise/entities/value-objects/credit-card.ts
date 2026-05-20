import { TransactionErrorMessages } from '@/core/consts/transaction';
import { ValueObject } from '@/core/entities/value-object';

export interface CreditCardProps {
  value: string;
}
export class CreditCard extends ValueObject<CreditCardProps> {
  get value() {
    return this.props.value;
  }

  private static validateCreditCard(card_number: string) {
    if (!card_number) {
      // Refatorar para erro específico
      throw new Error(TransactionErrorMessages.PAYLOAD_ERROR);
    }

    if (card_number.toString().length < 13 || card_number.toString().length > 19) {
      throw new Error('card_number must be between 13 and 19 digits');
    }
  }

  static createCreditCard(card_number: string) {
    CreditCard.validateCreditCard(card_number);
    return new CreditCard({
      value: card_number,
    });
  }
}
