export type PrimitiveOf<T> =
  // Se for um value-object com propriedade 'value', extrai o tipo dela
  T extends { value: infer V }
    ? V
    : // Se for um value-object com propriedade 'amount', extrai o tipo dela
      T extends { amount: infer V }
      ? V
      : T extends Date // Se for Date, retorna Date
        ? Date
        : // Se for undefined, retorna undefined
          T extends undefined
          ? undefined
          : // Senão, retorna o próprio tipo
            T;
