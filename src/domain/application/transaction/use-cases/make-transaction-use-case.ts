import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { Timestamp } from '@/domain/enterprise/entities/value-objects/timestamp';
import { ID } from '@/core/entities/id';
import { CreditCard } from '@/domain/enterprise/entities/value-objects/credit-card';
import { TransactionErrorMessages } from '@/core/consts/transaction';
import { Authorizer } from '../../shared/gateways/authorizer.gateway';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';

interface MakeTransactionUseCaseRequest {
  id?: ID;
  card_number: string;
  amount: number;
  currency: CURRENCY_OPTIONS;
  merchant: string;
  timestamp: Date;
}

type MakeTransactionUseCaseResponse = { transaction: Transaction };
// type MakeTransactionUseCaseResponse = { status: PAYMENT_STATUS; authorize_id: string };

export class MakeTransactionUseCase {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly authorizer: Authorizer,
  ) {}

  async execute({
    id,
    card_number,
    amount,
    currency,
    merchant,
    timestamp,
  }: MakeTransactionUseCaseRequest): Promise<MakeTransactionUseCaseResponse> {
    // Validar payload
    this.validatePayload({
      card_number,
      amount,
      currency,
      merchant,
      timestamp,
    });

    const transaction = Transaction.create(
      {
        card_number: CreditCard.createCreditCard(card_number),
        amount,
        currency,
        merchant,
        timestamp: Timestamp.createTimestamp(timestamp),
      },
      id,
    );

    const authorize_transaction = await this.authorizer.authorize(transaction);

    if (!authorize_transaction) {
      throw new Error('rejected');
    }
    // Set the authorizer_id
    transaction.authorizeId = authorize_transaction.authorize_id;
    transaction.changeStatus(PAYMENT_STATUS.APPROVED);

    const newTransaction = await this.transactionsRepository.makeTransaction(transaction);

    if (!newTransaction) {
      throw new Error('Error on transaction, aborting...');
    }

    return { transaction: newTransaction };
  }

  private validatePayload(payload: MakeTransactionUseCaseRequest) {
    const { card_number, amount, currency, merchant, timestamp } = payload;

    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!card_number || !currency || !merchant || !timestamp) {
      throw new Error('Missing required fields in payload');
    }

    if (payload.timestamp.getTime() > Date.now()) {
      throw new Error(TransactionErrorMessages.TIMESTAMP_ON_FUTURE);
    }
  }
}
