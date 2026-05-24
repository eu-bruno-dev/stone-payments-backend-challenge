import { makeTransaction } from 'test/factories/make-transaction';
import { Transaction } from './transaction';
import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { TRANSACTION_ERROR_MESSAGES } from '@/core/consts/transaction';
import { PAYMENT_STATUS } from '@/core/consts/payment-status';

suite('[Transaction]', () => {
  beforeEach(() => {});

  describe('Create transaction', () => {
    it('should be able to create a valid transaction instance', () => {
      const transaction = makeTransaction({
        merchant: 'Amazon',
      });

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBeDefined();
      expect(transaction.currency).toEqual(CURRENCY_OPTIONS.BRL);
      expect(transaction.merchant).toEqual('Amazon');
      expect(transaction.status).toEqual(PAYMENT_STATUS.PENDING);
    });

    it('should be able to create a valid transaction instance with high amount', () => {
      const transaction = makeTransaction({
        amount: 10_001,
        merchant: 'Amazon',
      });

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBeDefined();
      expect(transaction.currency).toEqual(CURRENCY_OPTIONS.BRL);
      expect(transaction.status).toEqual(PAYMENT_STATUS.HIGH_AMOUNT);
    });

    it('should not be able to create transaction instance with insuficient amount', () => {
      expect(() => makeTransaction({ amount: 0 })).toThrow('Amount must be greater than zero');
    });

    it('should not be able to create transaction instance with invalid timestamp', () => {
      expect(() =>
        makeTransaction({ timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 /* 1 dia */) }),
      ).toThrow(TRANSACTION_ERROR_MESSAGES.TIMESTAMP_ON_FUTURE);
    });

    it('should not be able to create transaction instance with invalid timestamp format', () => {
      expect(() => makeTransaction({ timestamp: new Date('invalid-timestamp') })).toThrow(
        TRANSACTION_ERROR_MESSAGES.TIMESTAMP_NOT_VALID,
      );
    });
  });
});
