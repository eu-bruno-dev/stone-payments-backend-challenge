export class CircularBuffer<T> {
  private readonly slots: Map<number, T> = new Map();
  private head = 0; // próxima posição a ser escrita
  private size = 0; // quantos itens válidos existem

  constructor(private readonly capacicty: number) {}

  push(item: T) {
    this.slots.set(this.head, item);
    this.head = (this.head + 1) % this.capacicty;

    if (this.size < this.capacicty) this.size++;
  }

  toArray(): T[] {
    const start = this.size < this.capacicty ? 0 : this.head;

    return Array.from({ length: this.size }, (_, i) => {
      const key = (start + i) % this.capacicty;
      return this.slots.get(key)!;
    });
  }

  get count() {
    return this.size;
  }

  get isFull() {
    return this.size === this.capacicty;
  }
}
