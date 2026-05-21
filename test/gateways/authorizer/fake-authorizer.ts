import { Authorizer } from '@/domain/application/shared/gateways/authorizer.gateway';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { randomUUID } from 'node:crypto';

export class FakeAuthorizer implements Authorizer {
  public isAuthorized = true;

  async authorize(transaction: Transaction): Promise<{ authorize_id: string }> {
    console.log(`Amount of ${transaction.amount} to authorize.`);

    // Simulate fetch call
    console.log('fetching the authorizer...');
    await new Promise((res) => setTimeout(res, 50));

    if (!this.isAuthorized) {
      console.log('Transaction NOT AUTHORIZED');
      this.isAuthorized = false;
      throw new Error('invalid payload');
    }
    console.log('Transaction AUTHORIZED');

    return { authorize_id: randomUUID() };
  }
}
