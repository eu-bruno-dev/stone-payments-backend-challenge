import { makeTransaction } from 'test/factories/make-transaction';
import { Transaction } from './transaction';
import { CURRENCY_OPTIONS } from '@/core/consts/currency-options';
import { TransactionErrorMessages } from '@/core/consts/transaction';

suite('[Transaction]', () => {
  beforeEach(() => {
    // sut = new MakeTransactionUseCase(transactionsRepository);
  });

  describe('Create transaction', () => {
    it('should be able to create a valid transaction instance', () => {
      const transaction = makeTransaction({
        merchant: 'Amazon',
      });

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBeDefined();
      expect(transaction.currency).toEqual(CURRENCY_OPTIONS.BRL);
    });

    it('should not be able to create transaction instance with insuficient amount', () => {
      expect(() => makeTransaction({ amount: 0 })).toThrow('Amount must be greater than zero');
    });

    it('should not be able to create transaction instance with invalid timestamp', () => {
      expect(() =>
        makeTransaction({ timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24) }),
      ).toThrow(TransactionErrorMessages.TIMESTAMP_ON_FUTURE);
    });

    it('should not be able to create transaction instance with invalid timestamp format', () => {
      expect(() => makeTransaction({ timestamp: new Date('invalid-timestamp') })).toThrow(
        TransactionErrorMessages.TIMESTAMP_NOT_VALID,
      );
    });
  });
});
