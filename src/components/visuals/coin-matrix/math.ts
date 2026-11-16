import { CORNER_KERNEL, INVERTIBLE_CORNER, SINGULAR_CORNER, SMALL_COUNTS, SPINE_KERNEL, SPINE_MATRIX } from './data';

export type Sign = -1 | 1;

export type SignMatrix = readonly (readonly Sign[])[];

export type IntegerMatrix = readonly (readonly number[])[];

export type RowPair = { first: number; second: number; relation: 'equal' | 'opposite' };

function matrixSize(matrix: IntegerMatrix): number {
  const size = matrix.length;

  if (size === 0 || matrix.some(row => row.length !== size)) throw new RangeError('A determinant needs a nonempty square matrix.');

  for (const row of matrix) {
    for (const value of row) {
      if (!Number.isSafeInteger(value)) throw new RangeError('Exact integer calculations require safely represented integer entries.');
    }
  }

  return size;
}

function integerAt(matrix: readonly (readonly bigint[])[], row: number, column: number): bigint {
  const value = matrix[row]?.[column];

  if (value === undefined) throw new Error('Every elimination position needs its exact integer entry.');

  return value;
}

/** Fraction-free Bareiss elimination, with exact divisibility checked. */
export function exactDeterminant(matrix: IntegerMatrix): bigint {
  const size = matrixSize(matrix);
  const work = matrix.map(row => row.map(value => BigInt(value)));
  let previous = 1n;
  let parity = 1n;

  for (let column = 0; column < size - 1; column++) {
    let pivotRow = column;

    while (pivotRow < size && integerAt(work, pivotRow, column) === 0n) pivotRow++;

    if (pivotRow === size) return 0n;

    if (pivotRow !== column) {
      const first = work[column];
      const second = work[pivotRow];

      if (!first || !second) throw new Error('Both pivot rows must exist before a row swap.');

      work[column] = second;
      work[pivotRow] = first;
      parity = -parity;
    }

    const pivot = integerAt(work, column, column);

    for (let row = column + 1; row < size; row++) {
      const target = work[row];

      if (!target) throw new Error('Each elimination row must exist.');

      for (let next = column + 1; next < size; next++) {
        const numerator = pivot * integerAt(work, row, next) - integerAt(work, row, column) * integerAt(work, column, next);

        if (numerator % previous !== 0n) throw new Error('Bareiss elimination must divide exactly over the integers.');

        target[next] = numerator / previous;
      }

      target[column] = 0n;
    }

    previous = pivot;
  }

  return parity * integerAt(work, size - 1, size - 1);
}

function gcd(first: bigint, second: bigint): bigint {
  let a = first < 0n ? -first : first;
  let b = second < 0n ? -second : second;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

/** Integer row elimination, reducing common factors without fractions. */
export function integerRank(matrix: IntegerMatrix): number {
  const size = matrixSize(matrix);
  const work = matrix.map(row => row.map(value => BigInt(value)));
  let rank = 0;

  for (let column = 0; column < size && rank < size; column++) {
    let pivotRow = rank;

    while (pivotRow < size && integerAt(work, pivotRow, column) === 0n) pivotRow++;

    if (pivotRow === size) continue;

    const selected = work[pivotRow];
    const current = work[rank];

    if (!selected || !current) throw new Error('Rank elimination needs its selected and current rows.');

    work[rank] = selected;
    work[pivotRow] = current;
    const pivot = integerAt(work, rank, column);

    for (let row = rank + 1; row < size; row++) {
      const factor = integerAt(work, row, column);
      const target = work[row];

      if (!target) throw new Error('Each rank-elimination row must exist.');
      if (factor === 0n) continue;

      for (let next = column; next < size; next++) target[next] = pivot * integerAt(work, row, next) - factor * integerAt(work, rank, next);

      const divisor = target.reduce((common, value) => gcd(common, value), 0n);

      if (divisor !== 0n) {
        for (let next = column; next < size; next++) target[next] = integerAt(work, row, next) / divisor;
      }
    }

    rank++;
  }

  return rank;
}

export function rowProducts(matrix: IntegerMatrix, vector: readonly number[]): number[][] {
  const size = matrixSize(matrix);

  if (vector.length !== size || vector.some(value => !Number.isSafeInteger(value))) throw new RangeError('The integer vector needs one safely represented coordinate per matrix column.');

  return matrix.map(row => row.map((value, index) => {
    const coordinate = vector[index];

    if (coordinate === undefined) throw new Error('Each row product needs its vector coordinate.');

    return value * coordinate;
  }));
}

export function rowPartialProducts(matrix: IntegerMatrix, vector: readonly number[]): number[][] {
  return rowProducts(matrix, vector).map(row => {
    const partials = [0];
    let total = 0;

    for (const value of row) {
      total += value;
      partials.push(total);
    }

    return partials;
  });
}

export function matrixVectorProduct(matrix: IntegerMatrix, vector: readonly number[]): number[] {
  return rowProducts(matrix, vector).map(row => row.reduce((sum, value) => sum + value, 0));
}

export function equalOrOppositePairs(matrix: SignMatrix): RowPair[] {
  const size = matrixSize(matrix);
  const pairs: RowPair[] = [];

  for (let first = 0; first < size; first++) {
    for (let second = first + 1; second < size; second++) {
      const a = matrix[first];
      const b = matrix[second];

      if (!a || !b) throw new Error('Each comparison needs both complete sign rows.');

      if (a.every((value, column) => value === b[column])) pairs.push({ first, second, relation: 'equal' });
      else if (a.every((value, column) => value === -Number(b[column]))) pairs.push({ first, second, relation: 'opposite' });
    }
  }

  return pairs;
}

function signAt(matrix: SignMatrix, row: number, column: number): Sign {
  const value = matrix[row]?.[column];

  if (value !== 1 && value !== -1) throw new Error('Each symmetric sign position must contain exactly +1 or −1.');

  return value;
}

/** Overwrite a matching row and column, with a coherent common 2×2 corner. */
export function symmetricCopyRows(matrix: SignMatrix, source: number, target: number): Sign[][] {
  const size = matrixSize(matrix);

  if (!Number.isInteger(source) || !Number.isInteger(target) || source < 0 || target < 0 || source >= size || target >= size || source === target) throw new RangeError('The what-if needs two distinct row indices.');

  const result = matrix.map(row => [...row]);
  const copied = result[target];

  if (!copied) throw new Error('The copied row must exist.');

  for (let column = 0; column < size; column++) {
    const value = signAt(matrix, source, column === target ? source : column);
    const mirrored = result[column];

    if (!mirrored) throw new Error('Every copied entry needs its matching symmetric column position.');

    copied[column] = value;
    mirrored[target] = value;
  }

  return result;
}

export function normaliseSymmetricSigns(matrix: SignMatrix) {
  const size = matrixSize(matrix);
  const globalSign = signAt(matrix, 0, 0);
  const diagonalSigns: Sign[] = [1];

  for (let index = 1; index < size; index++) diagonalSigns.push(globalSign === signAt(matrix, 0, index) ? 1 : -1);

  const normalised = matrix.map((row, i) => row.map((value, j) => {
    const first = diagonalSigns[i];
    const second = diagonalSigns[j];

    if (first === undefined || second === undefined) throw new Error('Each normalization position needs its row and column sign.');

    const product = globalSign * first * value * second;

    if (product !== 1 && product !== -1) throw new Error('Conjugation must preserve sign entries.');

    return product;
  }));

  return { matrix: normalised, globalSign, diagonalSigns };
}

export function* symmetricSigns(size: number, normalised = false): Generator<SignMatrix> {
  if (!Number.isInteger(size) || size < 1 || size > 6 || !normalised && size > 4) throw new RangeError('Live enumeration covers full matrices through size4, or normalized matrices through size6.');

  const positions: [number, number][] = [];

  for (let row = 0; row < size; row++) {
    for (let column = row; column < size; column++) {
      if (!normalised || row > 0) positions.push([row, column]);
    }
  }

  for (let mask = 0; mask < 2 ** positions.length; mask++) {
    const matrix: Sign[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => 1));

    for (const [bit, [row, column]] of positions.entries()) {
      const first = matrix[row];
      const second = matrix[column];

      if (!first || !second) throw new Error('Each independently chosen sign needs both symmetric positions.');

      const sign = mask & 1 << bit ? -1 : 1;
      first[column] = sign;
      second[row] = sign;
    }

    yield matrix;
  }
}

export function countSymmetricSigns(size: number, normalised = false) {
  let total = 0;
  let singular = 0;
  let unpaired = 0;

  for (const matrix of symmetricSigns(size, normalised)) {
    total++;

    if (exactDeterminant(matrix) === 0n) {
      singular++;

      if (equalOrOppositePairs(matrix).length === 0) unpaired++;
    }
  }

  return { n: size, total, singular, unpaired, fraction: singular / total };
}

function checkProbability(p: number): void {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError('A coin probability must lie between zero and one.');
}

export function pairAgreement(p: number): number {
  checkProbability(p);

  return p * p + (1 - p) * (1 - p);
}

export function cornerAgreement(p: number): number {
  checkProbability(p);

  return p ** 3 + (1 - p) ** 3;
}

export function specifiedEqualRowsProbability(size: number, p: number): number {
  if (!Number.isInteger(size) || size < 2) throw new RangeError('Two specified rows require an integer matrix size of at least two.');

  return cornerAgreement(p) * pairAgreement(p) ** (size - 2);
}

export function buildCoinMatrixModel() {
  const matrix = SPINE_MATRIX;
  const kernel = SPINE_KERNEL;
  const whatIfMatrix = symmetricCopyRows(matrix, 0, 1);
  const whatIfKernel = [1, -1, 0, 0, 0, 0] as const;
  const products = rowProducts(matrix, kernel);
  const partialProducts = rowPartialProducts(matrix, kernel);
  const product = matrixVectorProduct(matrix, kernel);
  const determinant = Number(exactDeterminant(matrix));
  const rank = integerRank(matrix);
  const liveCounts = [1, 2, 3, 4].map(size => countSymmetricSigns(size));

  if (determinant !== 0 || rank !== 5 || product.some(value => value !== 0) || equalOrOppositePairs(matrix).length > 0) throw new Error('The carried exact example must have rank5 and no equal or opposite rows.');

  return {
    matrix, kernel, whatIfMatrix, whatIfKernel, whatIfProduct: matrixVectorProduct(whatIfMatrix, whatIfKernel),
    cornerSingular: SINGULAR_CORNER, cornerInvertible: INVERTIBLE_CORNER, cornerKernel: CORNER_KERNEL,
    cornerSingularProduct: matrixVectorProduct(SINGULAR_CORNER, CORNER_KERNEL),
    cornerInvertibleProduct: matrixVectorProduct(INVERTIBLE_CORNER, CORNER_KERNEL),
    cornerSingularDeterminant: Number(exactDeterminant(SINGULAR_CORNER)),
    cornerInvertibleDeterminant: Number(exactDeterminant(INVERTIBLE_CORNER)),
    rowProducts: products, partialProducts, product, determinant, rank, counts: SMALL_COUNTS, liveCounts,
    fair: { n: 6, p: .5, pairAgreement: pairAgreement(.5), cornerAgreement: cornerAgreement(.5), specifiedRows: specifiedEqualRowsProbability(6, .5) },
    bias: { p: .75, agreement: pairAgreement(.75), cornerAgreement: cornerAgreement(.75) },
  };
}

export type CoinMatrixModel = ReturnType<typeof buildCoinMatrixModel>;
