export type Complex = { re: number; im: number };

export type MeasurementBasis = { label: string; vectors: Complex[][] };

export type BasisErrors = {
  maxGramError: number;
  maxUnbiasedError: number;
  maxProbabilitySumError: number;
};

export type OverlapPair = {
  first: number;
  second: number;
  values: number[][];
  maxBiasError: number;
  maxProbabilitySumError: number;
};

export type BasisFamily = {
  dimension: 2 | 3 | 5 | 6 | 7;
  bases: MeasurementBasis[];
  pairs: OverlapPair[];
  count: number;
  upperBound: number;
  errors: BasisErrors;
};

function phase(turn: number): Complex {
  return { re: Math.cos(2 * Math.PI * turn), im: Math.sin(2 * Math.PI * turn) };
}

function product(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function inner(a: readonly Complex[], b: readonly Complex[]): Complex {
  if (a.length !== b.length) throw new Error('The overlap vectors must belong to the same dimension.');

  let re = 0;
  let im = 0;

  for (let index = 0; index < a.length; index++) {
    const first = a[index];
    const second = b[index];

    if (!first || !second) throw new Error('Every vector coordinate is needed for its inner product.');

    re += first.re * second.re + first.im * second.im;
    im += first.re * second.im - first.im * second.re;
  }

  return { re, im };
}

function standardBasis(dimension: number, label: string): MeasurementBasis {
  return {
    label,
    vectors: Array.from({ length: dimension }, (_, column) =>
      Array.from({ length: dimension }, (_, row) => ({ re: Number(row === column), im: 0 }))),
  };
}

function twoLevelBases(): MeasurementBasis[] {
  const s = 1 / Math.sqrt(2);

  return [
    standardBasis(2, 'A₀'),
    { label: 'A₁', vectors: [[{ re: s, im: 0 }, { re: s, im: 0 }], [{ re: s, im: 0 }, { re: -s, im: 0 }]] },
    { label: 'A₂', vectors: [[{ re: s, im: 0 }, { re: 0, im: s }], [{ re: s, im: 0 }, { re: 0, im: -s }]] },
  ];
}

function quadraticBasis(prime: number, quadratic: number, label: string): MeasurementBasis {
  const scale = 1 / Math.sqrt(prime);

  return {
    label,
    vectors: Array.from({ length: prime }, (_, column) =>
      Array.from({ length: prime }, (_, row) => {
        const value = phase(((quadratic * row * row + column * row) % prime) / prime);

        return { re: value.re * scale, im: value.im * scale };
      })),
  };
}

function threeLevelBases(): MeasurementBasis[] {
  const fourier = quadraticBasis(3, 0, 'B₁');
  const omega = phase(1 / 3);
  const diagonal = [{ re: 1, im: 0 }, omega, omega];
  const third = {
    label: 'B₂',
    vectors: fourier.vectors.map(vector => vector.map((coordinate, row) => {
      const multiplier = diagonal[row];

      if (!multiplier) throw new Error('The three-level diagonal needs one multiplier per coordinate.');

      return product(multiplier, coordinate);
    })),
  };

  return [standardBasis(3, 'B₀'), fourier, third];
}

function tensorBasis(a: MeasurementBasis, b: MeasurementBasis, label: string): MeasurementBasis {
  const vectors: Complex[][] = [];

  for (const first of a.vectors) {
    for (const second of b.vectors) {
      const vector: Complex[] = [];

      for (const x of first) {
        for (const y of second) vector.push(product(x, y));
      }

      vectors.push(vector);
    }
  }

  return { label, vectors };
}

function family(dimension: BasisFamily['dimension'], bases: MeasurementBasis[]): BasisFamily {
  const pairs: OverlapPair[] = [];
  const errors: BasisErrors = { maxGramError: 0, maxUnbiasedError: 0, maxProbabilitySumError: 0 };

  for (const basis of bases) {
    if (basis.vectors.length !== dimension) throw new Error('Each displayed basis must have one vector per dimension.');

    for (let first = 0; first < dimension; first++) {
      for (let second = 0; second < dimension; second++) {
        const a = basis.vectors[first];
        const b = basis.vectors[second];

        if (!a || !b || a.length !== dimension || b.length !== dimension) throw new Error('Every displayed basis vector needs all its coordinates.');

        const value = inner(a, b);
        errors.maxGramError = Math.max(errors.maxGramError, Math.hypot(value.re - Number(first === second), value.im));
      }
    }
  }

  for (let first = 0; first < bases.length; first++) {
    for (let second = first + 1; second < bases.length; second++) {
      const a = bases[first];
      const b = bases[second];

      if (!a || !b) throw new Error('Each overlap table needs both displayed bases.');

      const values = a.vectors.map(vector => b.vectors.map(other => {
        const value = inner(vector, other);

        return value.re * value.re + value.im * value.im;
      }));
      let maxBiasError = 0;
      let maxProbabilitySumError = 0;

      for (let row = 0; row < dimension; row++) {
        const probabilities = values[row];

        if (!probabilities) throw new Error('Every overlap table needs all its outcome rows.');

        let rowSum = 0;
        let columnSum = 0;

        for (let column = 0; column < dimension; column++) {
          const probability = probabilities[column];
          const transposed = values[column]?.[row];

          if (probability === undefined || transposed === undefined) throw new Error('Every overlap table must be square and complete.');

          rowSum += probability;
          columnSum += transposed;
          maxBiasError = Math.max(maxBiasError, Math.abs(probability - 1 / dimension));
        }

        maxProbabilitySumError = Math.max(maxProbabilitySumError, Math.abs(rowSum - 1), Math.abs(columnSum - 1));
      }

      pairs.push({ first, second, values, maxBiasError, maxProbabilitySumError });
      errors.maxUnbiasedError = Math.max(errors.maxUnbiasedError, maxBiasError);
      errors.maxProbabilitySumError = Math.max(errors.maxProbabilitySumError, maxProbabilitySumError);
    }
  }

  return { dimension, bases, pairs, count: bases.length, upperBound: dimension + 1, errors };
}

export function buildThreeOfSevenModel() {
  const a = twoLevelBases();
  const b = threeLevelBases();
  const tensor: MeasurementBasis[] = [];

  for (let index = 0; index < a.length; index++) {
    const first = a[index];
    const second = b[index];

    if (!first || !second) throw new Error('The tensor triple needs matching two- and three-level bases.');

    tensor.push(tensorBasis(first, second, `U${index}`));
  }

  const stage2 = family(2, a);
  const stage3 = family(3, b);
  const six = family(6, tensor);
  const primeFamilies = [stage2];

  for (const prime of [3, 5, 7] as const) {
    const bases = [standardBasis(prime, 'STANDARD')];

    for (let quadratic = 0; quadratic < prime; quadratic++) bases.push(quadraticBasis(prime, quadratic, `Q${quadratic}`));

    primeFamilies.push(family(prime, bases));
  }

  const errors: BasisErrors = { maxGramError: 0, maxUnbiasedError: 0, maxProbabilitySumError: 0 };

  for (const current of [stage2, stage3, six, ...primeFamilies]) {
    errors.maxGramError = Math.max(errors.maxGramError, current.errors.maxGramError);
    errors.maxUnbiasedError = Math.max(errors.maxUnbiasedError, current.errors.maxUnbiasedError);
    errors.maxProbabilitySumError = Math.max(errors.maxProbabilitySumError, current.errors.maxProbabilitySumError);
  }

  return { stage2, stage3, six, primeFamilies, errors };
}

export type ThreeOfSevenModel = ReturnType<typeof buildThreeOfSevenModel>;
