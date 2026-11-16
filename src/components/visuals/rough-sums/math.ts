export type LogPower = 2 | 3;

export type IntegralRow = { T: number; k3: number; k2: number };

export type RoughSumsData = {
  coefficients: number[];
  integrals: IntegralRow[];
  audit: { zeroCoefficientError: number; coefficientTailBound: number };
};

export type PlotCache = { x: Float64Array; functionValues: Float64Array; partialValues: Float64Array[] };

export const PARAMETERS = {
  maxOrder: 200,
  coefficientT: 40,
  coefficientStep: .0005,
  integralPanels: 400000,
  integralLimits: [1e2, 1e4, 1e6, 1e8],
} as const;

const LOG_PI = Math.log(Math.PI);

const LOG_TWO = Math.log(2);

export function evaluateFunction(x: number, power: LogPower = 3): number {
  if (!Number.isFinite(x)) throw new RangeError('The periodic function needs a finite real argument.');

  const turn = 2 * Math.PI;
  const withinTurn = Math.abs(x) % turn;
  const radius = withinTurn > Math.PI ? turn - withinTurn : withinTurn;

  if (radius === 0) return Infinity;

  const logarithm = 1 + LOG_PI - Math.log(radius);

  return 1 / (radius * logarithm ** power);
}

function checkOrder(coefficients: readonly number[], order: number): void {
  if (!Number.isFinite(order) || order < 0 || order > coefficients.length - 1) throw new RangeError('The summation order must be inside the computed coefficient range.');
}

export function partialSum(coefficients: readonly number[], order: number, x: number): number {
  checkOrder(coefficients, order);

  if (!Number.isInteger(order) || !Number.isFinite(x)) throw new RangeError('A partial sum has integer order and a finite real argument.');

  const constant = coefficients[0];

  if (constant === undefined) throw new Error('A Fourier sum needs its constant coefficient.');

  let sum = constant;

  for (let k = 1; k <= order; k++) {
    const coefficient = coefficients[k];

    if (coefficient === undefined) throw new Error('Every requested Fourier coefficient must exist.');

    sum += 2 * coefficient * Math.cos(k * x);
  }

  return sum;
}

// Between integer orders this adds a fraction of exactly one next cosine. It
// is a continuous drawing path, not an additional Fourier partial sum.
export function interpolatedSum(coefficients: readonly number[], order: number, x: number): number {
  checkOrder(coefficients, order);
  const integerOrder = Math.floor(order);
  const fraction = order - integerOrder;
  const sum = partialSum(coefficients, integerOrder, x);

  if (fraction === 0) return sum;

  const next = coefficients[integerOrder + 1];

  if (next === undefined) throw new Error('The fractional drawing step needs its next cosine coefficient.');

  return sum + fraction * 2 * next * Math.cos((integerOrder + 1) * x);
}

export function summationPath(coefficients: readonly number[], order: number, x: number): number[] {
  checkOrder(coefficients, order);

  if (!Number.isInteger(order) || !Number.isFinite(x)) throw new RangeError('A summation path has integer order and a finite real argument.');

  const constant = coefficients[0];

  if (constant === undefined) throw new Error('A summation path needs its constant coefficient.');

  const path = [constant];
  let sum = constant;

  for (let k = 1; k <= order; k++) {
    const coefficient = coefficients[k];

    if (coefficient === undefined) throw new Error('Every step of the summation path needs its coefficient.');

    sum += 2 * coefficient * Math.cos(k * x);
    path.push(sum);
  }

  return path;
}

export function preparePlot(coefficients: readonly number[]): PlotCache {
  const constant = coefficients[0];

  if (constant === undefined) throw new Error('The plot cache needs a constant Fourier coefficient.');

  const samples = new Set<number>();

  for (let index = 0; index <= 1536; index++) samples.add(-Math.PI + 2 * Math.PI * index / 1536);

  for (let index = 0; index < 160; index++) {
    const radius = Math.exp(Math.log(1e-8) + (Math.log(.2) - Math.log(1e-8)) * index / 159);
    samples.add(radius);
    samples.add(-radius);
  }

  samples.add(0);

  for (const radius of [.05, .5, 1, 2, 3]) {
    samples.add(radius);
    samples.add(-radius);
  }

  const x = Float64Array.from([...samples].sort((a, b) => a - b));
  const functionValues = Float64Array.from(x, position => evaluateFunction(position));
  const partialValues = [new Float64Array(x.length).fill(constant)];

  for (let order = 1; order < coefficients.length; order++) {
    const coefficient = coefficients[order];
    const before = partialValues[order - 1];

    if (coefficient === undefined || !before) throw new Error('Each cached curve needs its preceding curve and next cosine.');

    const current = new Float64Array(x.length);

    for (const [index, position] of x.entries()) {
      const previous = before[index];

      if (previous === undefined) throw new Error('Each cached curve needs every preceding sample.');

      current[index] = previous + 2 * coefficient * Math.cos(order * position);
    }

    partialValues.push(current);
  }

  return { x, functionValues, partialValues };
}

export function coefficientTailBound(order: number, tMax: number = PARAMETERS.coefficientT): number {
  if (!Number.isInteger(order) || order < 0 || !(tMax > 0) || !Number.isFinite(tMax)) throw new RangeError('The tail bound needs a nonnegative integer frequency and finite positive cutoff.');

  return order ** 2 * Math.PI * Math.exp(-2 * tMax) / (4 * (1 + tMax) ** 3);
}

export function computeCoefficients(maxOrder: number = PARAMETERS.maxOrder, tMax: number = PARAMETERS.coefficientT, step: number = PARAMETERS.coefficientStep): number[] {
  const panels = Math.round(tMax / step);

  if (!Number.isInteger(maxOrder) || maxOrder < 0 || !(tMax > 0) || !(step > 0) || !Number.isFinite(panels) || panels < 2 || panels % 2 !== 0 || Math.abs(panels * step - tMax) > 1e-10) throw new RangeError('Simpson quadrature needs a nonnegative integer order and an even number of panels covering the finite interval.');

  const coefficients = Array.from({ length: maxOrder + 1 }, () => 0);

  for (let index = 0; index <= panels; index++) {
    const t = index * step;
    const weight = index === 0 || index === panels ? 1 : index % 2 === 1 ? 4 : 2;
    const base = weight * step / (3 * Math.PI * (1 + t) ** 3);
    const cosine = Math.cos(Math.PI * Math.exp(-t));
    let previous = 1;
    let current = cosine;
    const constant = coefficients[0];

    if (constant === undefined) throw new Error('The coefficient accumulator needs its constant term.');

    coefficients[0] = constant + base;

    for (let k = 1; k <= maxOrder; k++) {
      const accumulated = coefficients[k];

      if (accumulated === undefined) throw new Error('Every coefficient accumulator must exist.');

      coefficients[k] = accumulated + base * current;
      const next = 2 * cosine * current - previous;
      previous = current;
      current = next;
    }
  }

  // Replacing cos(k*pi*exp(-t)) by 1 beyond tMax is exact for k=0.
  // For k>0, coefficientTailBound bounds the omitted nonconstant correction.
  const tail = .5 / ((1 + tMax) ** 2 * Math.PI);

  for (const [index, value] of coefficients.entries()) coefficients[index] = value + tail;

  return coefficients;
}

export function logAddExp(a: number, b: number): number {
  const larger = Math.max(a, b);

  if (larger === Infinity || larger === -Infinity) return larger;

  return larger + Math.log1p(Math.exp(Math.min(a, b) - larger));
}

export function normalizedLLogLIntegral(power: LogPower, tMax: number, panels: number = PARAMETERS.integralPanels): number {
  if (!(tMax > 0) || !Number.isFinite(tMax) || !Number.isInteger(panels) || panels < 1) throw new RangeError('The truncated Orlicz integral needs a finite positive cutoff and a positive panel count.');

  const upper = Math.log1p(tMax);
  const step = upper / panels;
  let integral = 0;

  for (let index = 0; index <= panels; index++) {
    const u = index * step;
    const t = Math.expm1(u);
    const logFunction = t - LOG_PI - power * u;
    const value = logAddExp(LOG_TWO, logFunction) * Math.exp(-(power - 1) * u);
    const weight = index === 0 || index === panels ? .5 : 1;
    integral += weight * value;
  }

  return integral * step / Math.PI;
}

export function buildRoughSumsData(): RoughSumsData {
  const coefficients = computeCoefficients();
  const constant = coefficients[0];

  if (constant === undefined) throw new Error('The computed Fourier data needs a constant term.');

  const integrals = PARAMETERS.integralLimits.map(T => ({ T, k3: normalizedLLogLIntegral(3, T), k2: normalizedLLogLIntegral(2, T) }));

  return {
    coefficients,
    integrals,
    audit: {
      zeroCoefficientError: Math.abs(constant - .5 / Math.PI),
      coefficientTailBound: coefficientTailBound(PARAMETERS.maxOrder),
    },
  };
}
