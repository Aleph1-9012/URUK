import { expect, test } from 'bun:test';
import { buildTiltedWavesModel } from './math';

type QuadratureNode = { at: number; weight: number };

function gaussLegendre(count: number, end: number): QuadratureNode[] {
  const nodes: QuadratureNode[] = [];

  for (let index = 1; index <= count; index++) {
    let root = Math.cos(Math.PI * (index - .25) / (count + .5));
    let derivative = 0;

    for (let iteration = 0; iteration < 20; iteration++) {
      let previous = 1;
      let current = root;

      for (let degree = 2; degree <= count; degree++) {
        const next = ((2 * degree - 1) * root * current - (degree - 1) * previous) / degree;
        previous = current;
        current = next;
      }

      derivative = count * (root * current - previous) / (root * root - 1);
      const change = current / derivative;
      root -= change;

      if (Math.abs(change) < 1e-15) break;
    }

    nodes.push({ at: (1 + root) * end / 2, weight: end / ((1 - root * root) * derivative * derivative) });
  }

  return nodes;
}

/** Independent cubature of the Bose integral, without a Bessel sum or its tail. */
function cubature(betaS: number, radialCount: number, angularCount: number): number {
  const radial = gaussLegendre(radialCount, Math.min(Math.PI * Math.sqrt(betaS), 12));
  const angular = gaussLegendre(angularCount, 1);
  let integral = 0;

  // Split the positive cube into its three maximum-coordinate regions.
  // k=(t,tu,tv) has Jacobian t^2, removing the origin singularity.
  for (const q of radial) {
    const t = q.at / Math.sqrt(betaS);

    for (const u of angular) {
      for (const v of angular) {
        const exponent = 4 * betaS * (Math.sin(t / 2) ** 2 + Math.sin(t * u.at / 2) ** 2 + Math.sin(t * v.at / 2) ** 2);
        integral += q.weight * u.weight * v.weight * q.at ** 2 / Math.expm1(exponent);
      }
    }
  }

  return 3 * integral / (Math.PI ** 3 * betaS ** 1.5);
}

test('271: the numerical ideal density agrees with independently refined three-dimensional cubature', () => {
  const model = buildTiltedWavesModel();

  for (const point of model.rows) {
    const coarse = cubature(point.betaS, 32, 12);
    const refined = cubature(point.betaS, 64, 24);

    expect(Math.abs(refined - coarse)).toBeLessThan(3e-12);
    expect(Math.abs(point.idealDensity - refined)).toBeLessThan(2e-13);
    expect(Math.abs(point.nextRatio - (refined - point.blochDensity) / point.latticeCorrection)).toBeLessThan(1e-6);
  }
});

test('271: cooling the ideal gas lowers its density and approaches both low-temperature asymptotes', () => {
  const model = buildTiltedWavesModel();
  let previous = model.curve[0];

  if (!previous) throw new Error('The live curve must have its warm endpoint.');

  for (const point of model.curve.slice(1)) {
    expect(point.temperatureOverS).toBeLessThan(previous.temperatureOverS);
    expect(point.idealDensity).toBeLessThan(previous.idealDensity);
    expect(point.ratio).toBeGreaterThan(1);
    expect(point.ratio).toBeLessThan(previous.ratio);
    expect(point.nextRatio).toBeGreaterThan(1);
    expect(point.nextRatio).toBeLessThan(previous.nextRatio);
    previous = point;
  }
});
