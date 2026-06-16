# Arquitetura de Workers - Orquestrador Concorrente

## 📋 Visão Geral

Implementação de um sistema de orquestração de workers concorrentes seguindo os princípios de **Clean Architecture** e **SOLID**, adaptando a estratégia original pensada em Go para JavaScript/TypeScript com NestJS.

## 🏗️ Estrutura

### 1. **WorkerGateway** (Domain Layer)
```
src/domain/application/shared/gateways/worker.gateway.ts
```

Define o contrato abstrato para processamento de tarefas:
- `WorkerTask`: Interface que representa uma tarefa a ser processada
- `WorkerResult`: Interface que representa o resultado do processamento
- `WorkerGateway`: Classe abstrata que define o método `process()`

**Princípios aplicados:**
- Dependency Inversion: Depende de abstrações, não de implementações concretas
- Single Responsibility: Apenas define o contrato

### 2. **WorkerPool** (Infrastructure Layer)
```
src/infra/shared/workers/worker-pool.ts
```

Orquestrador de workers com:
- **Fila de tarefas**: `taskQueue` gerencia tarefas pendentes
- **Controle de concorrência**: `activeWorkers` e `maxWorkers` limitam processamento simultâneo
- **WORKER_COUNT**: Configurável via variável de ambiente (padrão: 4)

**Funcionalidades:**
```typescript
enqueue(task)        // Enfileira uma tarefa
drain()              // Aguarda conclusão de todas as tarefas
getQueueSize()       // Retorna tamanho da fila
getActiveWorkers()   // Retorna workers ativos
```

**Ciclo de vida:**
- `onModuleInit()`: Inicializa o pool
- `onModuleDestroy()`: Encerra gracefully

**Princípios aplicados:**
- Single Responsibility: Apenas orquestra tarefas
- Open/Closed: Extensível para diferentes gateways
- Dependency Injection: Depende de WorkerGateway abstrato

### 3. **Configuração de Ambiente**
```
src/infra/shared/env/env.schema.ts
```

```typescript
WORKER_COUNT: z.coerce.number().default(4)
```

Permite configuração do número de workers concorrentes sem alterar código.

### 4. **WorkerModule** (NestJS Integration)
```
src/infra/shared/workers/worker.module.ts
src/infra/shared/workers/configurable-worker.module.ts
```

- `WorkerModule`: Módulo padrão exporta WorkerPool
- `ConfigurableWorkerModule`: Suporta diferentes implementações de WorkerGateway

### 5. **TransactionService** (Application Layer)
```
src/domain/application/transaction/transaction.service.ts
```

Serviço que orquestra processamento de transações:
- `processTransaction()`: Executa o use case
- `enqueueTransaction()`: Enfileira para processamento concorrente
- `getQueueStatus()`: Retorna status da fila

### 6. **Implementações Fake** (Test Layer)
```
test/gateways/workers/fake-worker.gateway.ts
```

Reutiliza a interface `WorkerGateway` para testes:
- Configurável: `processDelay`, `shouldFail`, `failureMessage`
- Sem dependências externas
- Simula processamento assíncrono

## 🔄 Fluxo de Processamento

```
Client Request
      ↓
TransactionService.processTransaction()
      ↓
MakeTransactionUseCase.execute()
      ↓
Transaction Validation & Creation
      ↓
[Opcional] WorkerPool.enqueue()
      ↓
WorkerGateway.process(task)
      ↓
Response
```

## 📊 Diagrama de Concorrência

```
Task Queue: [T1, T2, T3, T4, T5]

Worker 1: T1 (50ms) → T3 (50ms) → T5 (50ms)
Worker 2: T2 (50ms) → T4 (50ms)

Tempo total: ~100ms (vs 250ms sequencial)
```

## 🧪 Testes

### WorkerPool Tests
```bash
npm test -- src/infra/shared/workers/worker-pool.spec.ts
```

Testa:
- ✅ Criação e configuração do pool
- ✅ Enfileiramento e processamento de tarefas
- ✅ Concorrência (múltiplas tarefas)
- ✅ Tratamento de erros
- ✅ Shutdown graceful
- ✅ Drenagem de fila

### FakeWorkerGateway Tests
```bash
npm test -- test/gateways/workers/fake-worker.gateway.spec.ts
```

Testa:
- ✅ Processamento bem-sucedido
- ✅ Simulação de falhas
- ✅ Configuração de delay
- ✅ Dados de retorno

## 🔧 Uso

### Configurar número de workers
```bash
WORKER_COUNT=8 npm start
```

### Usar em um controlador (exemplo)
```typescript
@Post('/transactions')
async createTransaction(@Body() data: CreateTransactionDto) {
  return this.transactionService.processTransaction({
    card_number: data.card_number,
    amount: data.amount,
    currency: data.currency,
    merchant: data.merchant,
    timestamp: new Date(),
  });
}
```

### Implementar novo WorkerGateway
```typescript
import { WorkerGateway, WorkerTask, WorkerResult } from '@/domain/application/shared/gateways/worker.gateway';

@Injectable()
export class RealWorkerGateway extends WorkerGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async process(task: WorkerTask): Promise<WorkerResult> {
    // Implementar lógica real de processamento
    // Ex: chamar API externa, banco de dados, etc
  }
}
```

## 📝 Princípios SOLID Aplicados

| Princípio | Aplicação |
|-----------|-----------|
| **S** - Single Responsibility | WorkerPool = orquestra; WorkerGateway = processa; TransactionService = coordena |
| **O** - Open/Closed | WorkerGateway abstrato permite novas implementações sem modificar WorkerPool |
| **L** - Liskov Substitution | Qualquer WorkerGateway pode substituir outro sem quebrar WorkerPool |
| **I** - Interface Segregation | Interfaces pequenas e focadas (WorkerTask, WorkerResult) |
| **D** - Dependency Inversion | WorkerPool depende de abstração (WorkerGateway), não de implementação |

## 🏛️ Clean Architecture Layers

```
Domain Layer
├── Application
│   ├── Gateways (worker.gateway.ts) ← Abstract contracts
│   └── UseCases
└── Enterprise
    └── Entities

Infrastructure Layer
├── Workers (worker-pool.ts) ← Orchestrator
├── Modules (worker.module.ts) ← DI Configuration
└── Env (configuration)

Test Layer
└── Gateways (fake-worker.gateway.ts) ← Test doubles
```

## 🚀 Performance

- **Throughput**: Processamento paralelo de `WORKER_COUNT` tarefas
- **Latência**: Reduzida significativamente em picos de carga
- **Memória**: Fila em-memory (configurável para persistência futura)
- **Escalabilidade**: Aumentar WORKER_COUNT aumenta throughput linearmente

## 🔐 Garantias

- ✅ Processamento ordenado (FIFO)
- ✅ Sem perda de tarefas (exceto em crash)
- ✅ Controle de concorrência
- ✅ Tratamento de erros
- ✅ Graceful shutdown
