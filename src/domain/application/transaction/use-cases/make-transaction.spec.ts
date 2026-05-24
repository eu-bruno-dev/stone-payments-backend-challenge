import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { MakeTransactionUseCase } from './make-transaction-use-case';
import { makeTransaction } from 'test/factories/make-transaction';
import { FakeAuthorizer } from 'test/gateways/authorizer/fake-authorizer';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';
import { TRANSACTION_ERROR_MESSAGES } from '@/core/consts/transaction';
import { WARNING_MESSAGES } from '@/core/consts/warning';

let transactionsRepository: InMemoryTransactionsRepository;
let authorizer: FakeAuthorizer;
/**
 * System Under Test (SUT)
 */
let sut: MakeTransactionUseCase;

suite('[MakeTransaction][UseCase]', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();
    authorizer = new FakeAuthorizer();

    sut = new MakeTransactionUseCase(transactionsRepository, authorizer);
  });

  describe('Transaction', () => {
    it('should be able to make a transaction', async () => {
      const transaction = makeTransaction({
        merchant: 'Amazon',
      });

      expect(transaction.status).toEqual(PAYMENT_STATUS.PENDING);
      expect(transaction.updated_at).not.toBeDefined();

      const result = await sut.execute({
        id: transaction.id,
        amount: transaction.amount,
        card_number: transaction.card_number.value,
        currency: transaction.currency,
        merchant: transaction.merchant,
        timestamp: transaction.timestamp,
      });

      const transactionID = transaction.id.toString();
      console.log(result.transaction);

      expect(result.transaction).toBeDefined();
      expect(transactionsRepository.items).toHaveLength(1);
      expect(result.transaction.id.toString()).toBe(transaction.id.toString());
      expect(result.transaction.authorize_id).toBeDefined();
      expect(transactionsRepository.items.get(transactionID)?.amount).toBe(transaction.amount);
      expect(result.transaction.status).toEqual(PAYMENT_STATUS.APPROVED);
      expect(result.transaction.updated_at).toBeDefined();
    });

    it('should be able to make a transaction that is considered suspicious', async () => {
      const transaction = makeTransaction({
        amount: 10_001,
        merchant: 'Amazon',
      });

      expect(transaction.status).toEqual(PAYMENT_STATUS.HIGH_AMOUNT);
      expect(transaction.updated_at).not.toBeDefined();

      const result = await sut.execute({
        id: transaction.id,
        amount: transaction.amount,
        card_number: transaction.card_number.value,
        currency: transaction.currency,
        merchant: transaction.merchant,
        timestamp: transaction.timestamp,
      });

      const transactionID = transaction.id.toString();
      console.log(result.transaction);

      expect(result.transaction).toBeDefined();
      expect(transactionsRepository.items).toHaveLength(1);
      expect(result.transaction.id.toString()).toBe(transaction.id.toString());
      expect(result.transaction.authorize_id).toBeDefined();
      expect(transactionsRepository.items.get(transactionID)?.amount).toBe(transaction.amount);
      expect(result.transaction.status).toEqual(PAYMENT_STATUS.APPROVED_WITH_WARNING);
      expect(result.transaction.warning).toEqual(WARNING_MESSAGES.HIGH_AMOUNT);
      expect(result.transaction.updated_at).toBeDefined();
    });

    it('should not be able to create a transaction with invalid card number format', async () => {
      const transaction = makeTransaction({});

      await expect(
        sut.execute({
          id: transaction.id,
          amount: transaction.amount,
          card_number: '121',
          currency: transaction.currency,
          merchant: transaction.merchant,
          timestamp: transaction.timestamp,
        }),
      ).rejects.toThrow('card_number must be between 13 and 19 digits');
    });

    it('should not be able to create a transaction with amount less than or equal to zero', async () => {
      const transaction = makeTransaction({});
      await expect(
        sut.execute({
          id: transaction.id,
          amount: 0,
          card_number: transaction.card_number.value,
          currency: transaction.currency,
          merchant: transaction.merchant,
          timestamp: transaction.timestamp,
        }),
      ).rejects.toThrow('Amount must be greater than zero');
    });

    it('should no be able to create a transaction with timestamp in the future', async () => {
      const transaction = makeTransaction({});
      await expect(
        sut.execute({
          id: transaction.id,
          amount: transaction.amount,
          card_number: transaction.card_number.value,
          currency: transaction.currency,
          merchant: transaction.merchant,
          timestamp: new Date('invalid-date'),
        }),
      ).rejects.toThrow(TRANSACTION_ERROR_MESSAGES.TIMESTAMP_NOT_VALID);
    });

    it('should no be able to create a transaction with timestamp in the future', async () => {
      const transaction = makeTransaction({});
      await expect(
        sut.execute({
          id: transaction.id,
          amount: transaction.amount,
          card_number: transaction.card_number.value,
          currency: transaction.currency,
          merchant: transaction.merchant,
          timestamp: new Date(Date.now() + 1000 * 60 * 60),
        }),
      ).rejects.toThrow(TRANSACTION_ERROR_MESSAGES.TIMESTAMP_ON_FUTURE);
    });
  });
});
