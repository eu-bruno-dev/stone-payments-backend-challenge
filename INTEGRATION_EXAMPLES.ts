/**
 * EXEMPLO DE INTEGRAÇÃO - Worker Architecture
 *
 * Este arquivo demonstra como integrar o WorkerPool e o WorkerGateway
 * em um controlador ou serviço da aplicação.
 *
 * A implementação segue Clean Architecture e SOLID principles.
 */

/**
 * EXEMPLO 1: Usar no Controlador
 *
 * import { Body, Controller, Post, Get } from '@nestjs/common';
 * import { TransactionService } from '@/domain/application/transaction/transaction.service';
 *
 * interface CreateTransactionDto {
 *   card_number: string;
 *   amount: number;
 *   currency: string;
 *   merchant: string;
 * }
 *
 * @Controller('/transactions')
 * export class TransactionsController {
 *   constructor(private readonly transactionService: TransactionService) {}
 *
 *   // Processa uma transação de forma síncrona
 *   @Post()
 *   async createTransaction(@Body() data: CreateTransactionDto) {
 *     return this.transactionService.processTransaction({
 *       card_number: data.card_number,
 *       amount: data.amount,
 *       currency: data.currency as any,
 *       merchant: data.merchant,
 *       timestamp: new Date(),
 *     });
 *   }
 *
 *   // Retorna o status atual da fila de processamento
 *   @Get('/queue-status')
 *   getQueueStatus() {
 *     return this.transactionService.getQueueStatus();
 *   }
 * }
 */

/**
 * EXEMPLO 2: Implementação Real do WorkerGateway
 *
 * import { Injectable } from '@nestjs/common';
 * import { WorkerGateway, WorkerTask, WorkerResult } from '@/domain/application/shared/gateways/worker.gateway';
 * import { HttpService } from '@nestjs/axios';
 *
 * // RealWorkerGateway - Implementação real para produção
 * // Pode fazer:
 * // - Chamadas a APIs externas
 * // - Processamento em worker threads (Node.js Worker Threads)
 * // - Comunicação com fila distribuída (RabbitMQ, Redis, etc)
 *
 * @Injectable()
 * export class RealWorkerGateway extends WorkerGateway {
 *   constructor(private readonly httpService: HttpService) {
 *     super();
 *   }
 *
 *   async process(task: WorkerTask): Promise<WorkerResult> {
 *     try {
 *       // Chamar API de autorização
 *       const response = await this.httpService
 *         .post('https://api.authorizer.com/authorize', {
 *           transactionId: task.transaction.id.toString(),
 *           amount: task.transaction.amount,
 *           cardNumber: task.transaction.card_number.value,
 *         })
 *         .toPromise();
 *
 *       return {
 *         success: true,
 *         data: response.data,
 *       };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: error instanceof Error ? error : new Error('Unknown error'),
 *       };
 *     }
 *   }
 * }
 */

/**
 * EXEMPLO 3: Configurar o Módulo com Implementação Real
 *
 * import { Module } from '@nestjs/common';
 * import { HttpModule } from '@nestjs/axios';
 * import { ConfigurableWorkerModule } from '@/infra/shared/workers/configurable-worker.module';
 * import { EnvModule } from '@/infra/shared/env/env.module';
 *
 * @Module({
 *   imports: [
 *     HttpModule,
 *     EnvModule,
 *     ConfigurableWorkerModule.forRoot({
 *       workerGatewayProvider: RealWorkerGateway,
 *     }),
 *   ],
 *   controllers: [TransactionsController],
 *   providers: [TransactionService],
 * })
 * export class TransactionsModule {}
 */

/**
 * EXEMPLO 4: Variáveis de Ambiente
 *
 * # .env
 * WORKER_COUNT=8
 *
 * # Para produção com mais workers:
 * # NODE_ENV=prod WORKER_COUNT=16 npm start
 *
 * # Para testes com menos workers:
 * # NODE_ENV=test WORKER_COUNT=2 npm test
 */

export {};
