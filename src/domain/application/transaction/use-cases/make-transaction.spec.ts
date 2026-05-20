import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions.repository';
import { MakeTransactionUseCase } from './make-transaction';
import { makeTransaction } from 'test/factories/make-transaction';

let transactionsRepository: InMemoryTransactionsRepository;

/**
 * System Under Test (SUT)
 */
let sut: MakeTransactionUseCase;

suite('[MakeTransaction][UseCase]', () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();

    sut = new MakeTransactionUseCase(transactionsRepository);
  });

  describe('Transfer money', () => {
    it('should be able make a transaction', async () => {
      const transaction = makeTransaction({
        merchant: 'Amazon',
      });

      const result = await sut.execute({
        id: transaction.id,
        amount: transaction.amount,
        card_number: transaction.card_number.value,
        currency: transaction.currency,
        merchant: transaction.merchant,
        timestamp: transaction.timestamp,
      });

      const transactionID = transaction.id.toString();
      // console.log(result.transaction);

      expect(result.transaction).toBeDefined();
      expect(transactionsRepository.items).toHaveLength(1);
      expect(result.transaction.id.toString()).toBe(transaction.id.toString());

      expect(transactionsRepository.items.get(transactionID)?.amount).toBe(transaction.amount);
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
  });
});
