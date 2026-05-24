import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { Timestamp } from '@/domain/enterprise/entities/value-objects/timestamp';
import { ID } from '@/core/entities/id';
import { CreditCard } from '@/domain/enterprise/entities/value-objects/credit-card';
import { TRANSACTION_ERROR_MESSAGES } from '@/core/consts/transaction';
import { Authorizer } from '../../shared/gateways/authorizer.gateway';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';
import { WARNING_MESSAGES } from '@/core/consts/warning';
import { SuspiciousRepository } from '../repositories/suspicious.repository';

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
    private readonly suspiciousRepository: SuspiciousRepository,
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

    // Validate if transaction is more than 5 in one minute time
    await this.checkTransactionPattern(card_number);

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
    transaction.setAuthorizeId(authorize_transaction.authorize_id);

    if (transaction.status === PAYMENT_STATUS.HIGH_AMOUNT) {
      transaction.changeStatus(PAYMENT_STATUS.APPROVED_WITH_WARNING);
      transaction.setWarningText(WARNING_MESSAGES.HIGH_AMOUNT);
      await this.suspiciousRepository.register(transaction);
    } else {
      transaction.changeStatus(PAYMENT_STATUS.APPROVED);
    }

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
      throw new Error(TRANSACTION_ERROR_MESSAGES.TIMESTAMP_ON_FUTURE);
    }
  }

  // TODO: FUCK
  // eslint-disable-next-line @typescript-eslint/require-await
  private async checkTransactionPattern(card_number: string) {
    return;
  }
}
