const ZETA_THREE_HALVES = 2.6123753486854883;
const ZETA_FIVE_HALVES = 1.3414872572509171;
const SUM_TERMS = 256;

function besselCoefficients(): number[] {
  const coefficients = [1];
  let previous = 1;

  for (let order = 1; order <= 8; order++) {
    previous *= (2 * order - 1) ** 2 / (8 * order);
    coefficients.push(previous);
  }

  return coefficients;
}

const BESSEL_COEFFICIENTS = besselCoefficients();

function cubedCoefficients(): number[] {
  const coefficients = Array<number>(7).fill(0);

  for (let first = 0; first < coefficients.length; first++) {
    for (let second = 0; second < coefficients.length - first; second++) {
      for (let third = 0; third < coefficients.length - first - second; third++) {
        const a = BESSEL_COEFFICIENTS[first];
        const b = BESSEL_COEFFICIENTS[second];
        const c = BESSEL_COEFFICIENTS[third];
        const order = first + second + third;
        const previous = coefficients[order];

        if (a === undefined || b === undefined || c === undefined || previous === undefined) throw new Error('The Bessel tail needs its complete finite coefficient table.');

        coefficients[order] = previous + a * b * c;
      }
    }
  }

  return coefficients;
}

const TAIL_COEFFICIENTS = cubedCoefficients();

/** Positive I_0 series at small arguments; eight-term asymptotics above 128. */
function scaledBessel(x: number): number {
  if (x < 128) {
    let term = 1;
    let sum = 1;

    for (let order = 1; order <= 512; order++) {
      term *= x * x / (4 * order * order);
      sum += term;

      if (term <= Number.EPSILON * sum) return Math.exp(-x) * sum;
    }

    throw new Error('The positive Bessel series did not converge within its numerical budget.');
  }

  let polynomial = 0;

  for (let order = BESSEL_COEFFICIENTS.length - 1; order >= 0; order--) {
    const coefficient = BESSEL_COEFFICIENTS[order];

    if (coefficient === undefined) throw new Error('The Bessel asymptotic polynomial needs every coefficient.');

    polynomial = polynomial / x + coefficient;
  }

  return polynomial / Math.sqrt(2 * Math.PI * x);
}

/** Euler–Maclaurin approximation to sum_{n > K} n^(-power), not an exact sum. */
function powerTail(power: number, terms: number): number {
  const start = terms + 1;
  let value = start ** (1 - power) / (power - 1) + .5 * start ** -power;
  let rising = power;
  let exponent = power + 1;

  for (const coefficient of [1 / 12, -1 / 720, 1 / 30240, -1 / 1209600]) {
    value += coefficient * rising * start ** -exponent;
    rising *= exponent * (exponent + 1);
    exponent += 2;
  }

  return value;
}

/** Numerical evaluation of the full ideal nearest-neighbour magnon integral. */
function idealDensity(betaS: number): number {
  let sum = 0;
  let compensation = 0;

  for (let n = 1; n <= SUM_TERMS; n++) {
    const term = scaledBessel(2 * betaS * n) ** 3 - compensation;
    const next = sum + term;
    compensation = (next - sum) - term;
    sum = next;
  }

  let tail = 0;

  for (let order = 0; order < TAIL_COEFFICIENTS.length; order++) {
    const coefficient = TAIL_COEFFICIENTS[order];

    if (coefficient === undefined) throw new Error('The ideal-density tail needs every asymptotic coefficient.');

    tail += coefficient * (2 * betaS) ** -order * powerTail(1.5 + order, SUM_TERMS);
  }

  return sum + (4 * Math.PI * betaS) ** -1.5 * tail;
}

export type IdealMagnonPoint = {
  betaS: number;
  temperatureOverS: number;
  idealDensity: number;
  blochDensity: number;
  latticeCorrection: number;
  ratio: number;
  nextRatio: number;
};

export function idealMagnonPoint(betaS: number): IdealMagnonPoint {
  if (!Number.isFinite(betaS) || betaS < 2 || betaS > 128) throw new RangeError('This numerical ideal-gas figure covers beta S from two through 128.');

  const blochDensity = ZETA_THREE_HALVES / (8 * Math.PI ** 1.5) * betaS ** -1.5;
  const latticeCorrection = 3 * ZETA_FIVE_HALVES / (128 * Math.PI ** 1.5) * betaS ** -2.5;
  const density = idealDensity(betaS);

  return {
    betaS,
    temperatureOverS: 1 / betaS,
    idealDensity: density,
    blochDensity,
    latticeCorrection,
    ratio: density / blochDensity,
    nextRatio: (density - blochDensity) / latticeCorrection,
  };
}

export function buildTiltedWavesModel() {
  const rows: IdealMagnonPoint[] = [];
  const curve: IdealMagnonPoint[] = [];

  for (let index = 0; index <= 96; index++) {
    const point = idealMagnonPoint(2 * 2 ** (index / 16));
    curve.push(point);

    if (index % 16 === 0) rows.push(point);
  }

  return {
    S: 1 as const,
    coefficient: ZETA_THREE_HALVES / (8 * Math.PI ** 1.5),
    correctionCoefficient: 3 * ZETA_FIVE_HALVES / (128 * Math.PI ** 1.5),
    rows,
    curve,
  };
}

export type TiltedWavesModel = ReturnType<typeof buildTiltedWavesModel>;
