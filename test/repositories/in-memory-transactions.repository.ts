/* eslint-disable @typescript-eslint/require-await */
import { TransactionsRepository } from '@/domain/application/transaction/repositories/transactions.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items = new Map<string, Transaction>();

  // 2. Seu novo índice secundário (Indexado por Número do Cartão)
  // Guardamos um array de transações para cada cartão
  private indexByCardNumber = new Map<string, Transaction[]>();

  public blacklistedCards = new Set<string>();

  async save(transaction: Transaction): Promise<Transaction | null> {
    // Salva no índice secundário (busca por cartão)
    const cardNumber = transaction.card_number.value;

    this.items.set(transaction.id.toString(), transaction);

    if (!this.indexByCardNumber.has(cardNumber)) {
      this.indexByCardNumber.set(cardNumber, []);
    }

    this.indexByCardNumber.get(cardNumber)!.unshift(transaction);

    return transaction;
  }

  async findLast50SuspiciousByCardNumber(card_number: string): Promise<Transaction[]> {
    const transactions = this.indexByCardNumber.get(card_number) || [];

    return transactions.slice(0, 50);
  }

  async flagCardAsSuspicious(card_number: string) {
    // Se o cartão já existir, o Set ignora automaticamente. Não duplica.
    this.blacklistedCards.add(card_number);
  }

  async isCardBlacklisted(card_number: string): Promise<boolean> {
    // O método 'has' do Set é absurdamente rápido (O(1))
    return this.blacklistedCards.has(card_number);
  }
}
