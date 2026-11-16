import { ANGLE_SAMPLES } from './data';

export type AngleField = readonly (readonly number[])[];

export type FourAngles = readonly [number, number, number, number];

export type Charge = -1 | 0 | 1;

export type Plaquette = {
  i: number;
  j: number;
  charge: Charge;
  angles: FourAngles;
  wrappedDifferences: FourAngles;
  totalAngle: number;
};

const TWO_PI = 2 * Math.PI;

function finiteAngle(angle: number): void {
  if (!Number.isFinite(angle)) throw new RangeError('An arrow needs a finite angle in radians.');
}

/** The Python sampler's convention, [-pi, pi). */
export function wrapAngle(angle: number): number {
  finiteAngle(angle);

  return ((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
}

export function interpolateAngle(from: number, to: number, progress: number): number {
  finiteAngle(from);
  finiteAngle(to);

  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError('Arrow interpolation stays between its two samples.');

  return from + progress * wrapAngle(to - from);
}

function fieldSize(field: AngleField): number {
  const size = field.length;

  if (size < 2 || field.some(row => row.length !== size)) throw new RangeError('The periodic angle field must be a square grid with at least two sites per side.');

  for (const row of field) {
    for (const angle of row) finiteAngle(angle);
  }

  return size;
}

function angleAt(field: AngleField, i: number, j: number): number {
  const angle = field[i]?.[j];

  if (angle === undefined) throw new Error('Every periodic grid site needs its stored angle.');

  return angle;
}

export function interpolateFields(from: AngleField, to: AngleField, progress: number): number[][] {
  const size = fieldSize(from);

  if (fieldSize(to) !== size) throw new RangeError('Carried arrow fields must have the same grid size.');

  return from.map((row, i) => row.map((angle, j) => interpolateAngle(angle, angleAt(to, i, j), progress)));
}

/** CCW corners in mathematical coordinates: (i,j), (i+1,j), (i+1,j+1), (i,j+1). */
export function plaquetteWinding(angles: FourAngles): Omit<Plaquette, 'i' | 'j'> {
  for (const angle of angles) finiteAngle(angle);

  const differences: FourAngles = [angles[1] - angles[0], angles[2] - angles[1], angles[3] - angles[2], angles[0] - angles[3]];
  const wrappedDifferences: FourAngles = [wrapAngle(differences[0]), wrapAngle(differences[1]), wrapAngle(differences[2]), wrapAngle(differences[3])];

  if (wrappedDifferences.some(angle => Math.PI - Math.abs(angle) < 1e-12)) throw new RangeError('A half-turn bond has no unique shortest angular increment.');

  // Raw differences telescope to zero. Count whole turns removed at the branch
  // cut as integers, rather than infer the integer by rounding a floating sum.
  const branchTurns = differences.reduce((turns, angle) => turns + Math.floor((angle + Math.PI) / TWO_PI), 0);
  const charge = branchTurns === 0 ? 0 : -branchTurns;
  const totalAngle = wrappedDifferences.reduce((sum, angle) => sum + angle, 0);

  if (Math.abs(totalAngle - charge * TWO_PI) > 1e-10) throw new Error('Wrapped plaquette increments must agree with the integer winding.');

  if (charge === -1 || charge === 0 || charge === 1) return { charge, angles, wrappedDifferences, totalAngle };

  throw new Error('Four unambiguous shortest increments can wind at most once.');
}

export function periodicPlaquettes(field: AngleField): Plaquette[] {
  const size = fieldSize(field);
  const plaquettes: Plaquette[] = [];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const angles: FourAngles = [angleAt(field, i, j), angleAt(field, (i + 1) % size, j), angleAt(field, (i + 1) % size, (j + 1) % size), angleAt(field, i, (j + 1) % size)];
      plaquettes.push({ i, j, ...plaquetteWinding(angles) });
    }
  }

  return plaquettes;
}

function sampleModel(beta: number, angles: AngleField) {
  const plaquettes = periodicPlaquettes(angles);
  const vortices: Plaquette[] = [];
  let positive = 0;
  let negative = 0;

  for (const plaquette of plaquettes) {
    if (plaquette.charge === 0) continue;

    vortices.push(plaquette);
    positive += Number(plaquette.charge === 1);
    negative += Number(plaquette.charge === -1);
  }

  const totalCharge = positive - negative;

  if (totalCharge !== 0) throw new Error('The periodic field must have balanced total winding charge.');

  return { beta, angles, plaquettes, vortices, vortexCount: vortices.length, positive, negative, totalCharge };
}

function separationLog(r: number): number {
  if (!Number.isFinite(r) || r <= 1) throw new RangeError('The logarithmically corrected curve uses separations greater than one.');

  return Math.log(r);
}

export function localSlope(r: number): number {
  return -.25 + 1 / (8 * separationLog(r));
}

/** Both amplitudes are one; the corrected curve has its actual distinct start. */
export function correlationAt(r: number) {
  const logR = separationLog(r);
  const logPure = -.25 * logR;
  const logCorrected = logPure + Math.log(logR) / 8;

  return { r, logR, pure: Math.exp(logPure), corrected: Math.exp(logCorrected), logPure, logCorrected, localSlope: localSlope(r) };
}

export function logCorrelationLength(delta: number, amplitude = 1): number {
  if (!Number.isFinite(delta) || delta <= 0 || !Number.isFinite(amplitude) || amplitude <= 0) throw new RangeError('The leading log-length formula needs a positive distance below the illustrative threshold and a positive amplitude.');

  return amplitude / Math.sqrt(delta);
}

function lengthAt(delta: number) {
  return { delta, illustrativeB: 1 - delta, logXi: logCorrelationLength(delta) };
}

/** Retained finite periodic pictures and leading formulas, not a computation of b_c or vortex binding. */
export function buildArrowGridModel() {
  const [coldField, middleField, hotField] = ANGLE_SAMPLES;
  const cold = sampleModel(coldField.beta, coldField.angles);
  const middle = sampleModel(middleField.beta, middleField.angles);
  const hot = sampleModel(hotField.beta, hotField.angles);
  const size = coldField.angles.length;
  const windingExample = hot.vortices.find(plaquette => plaquette.charge === 1 && plaquette.i < size - 1 && plaquette.j < size - 1 && plaquette.wrappedDifferences.every(angle => angle > 0 && angle < Math.PI - .25));

  if (!windingExample) throw new Error('The enlarged winding needs an actual interior positive plaquette from the hot sample.');

  const logStart = Math.log(10);
  const logEnd = Math.log(1e8);
  const correlation = Array.from({ length: 141 }, (_, index) => correlationAt(index === 0 ? 10 : index === 140 ? 1e8 : Math.exp(logStart + (logEnd - logStart) * index / 140)));
  const length = Array.from({ length: 141 }, (_, index) => lengthAt(Math.exp(Math.log(.5) + (Math.log(.0001) - Math.log(.5)) * index / 140)));

  return {
    size, samples: [cold, middle, hot], cold, middle, hot, windingExample,
    correlation, correlationReadouts: [10, 100, 10000, 1e8].map(correlationAt),
    length, lengthReadouts: [.5, .1, .01, .0001].map(lengthAt), illustrativeCriticalB: 1,
  };
}

export type ArrowGridModel = ReturnType<typeof buildArrowGridModel>;
