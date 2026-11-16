import { expect, test } from 'bun:test';
import reference from './test-fixture.json';
import { buildFourierModel, fftTrace, sampleSignal, savingAtLnLn, savingAtLog2, SAVING_EPSILON, THETA_DECIMAL, type Complex } from './math';

function directTransform(input: readonly Complex[]): Complex[] {
  return Array.from({ length: input.length }, (_, frequency) => {
    let re = 0;
    let im = 0;

    for (const [sample, value] of input.entries()) {
      const phase = 2 * Math.PI * frequency * sample / input.length;
      re += value.re * Math.cos(phase) - value.im * Math.sin(phase);
      im += value.re * Math.sin(phase) + value.im * Math.cos(phase);
    }

    return { re, im };
  });
}

test('130: positive-root radix-two transforms agree with the definition and preserve unnormalized Fourier energy', () => {
  for (const n of [1, 2, 4, 8, 16, 32, 64, 128, 256]) {
    const input = sampleSignal(n);
    const trace = fftTrace(input);

    if (n <= 64) {
      const expected = directTransform(input);

      for (const [frequency, actual] of trace.output.entries()) {
        const value = expected[frequency];

        if (!value) throw new Error('Each FFT output needs its independently summed Fourier value.');

        expect(actual.re).toBeCloseTo(value.re, 9);
        expect(actual.im).toBeCloseTo(value.im, 9);
      }
    }

    const inputEnergy = input.reduce((sum, value) => sum + value.re ** 2 + value.im ** 2, 0);
    const outputEnergy = trace.output.reduce((sum, value) => sum + value.re ** 2 + value.im ** 2, 0);
    expect(outputEnergy).toBeCloseTo(n * inputEnergy, 7);
    const twice = fftTrace(trace.output).output;

    for (const [index, actual] of twice.entries()) {
      const original = input[(n - index) % n];

      if (!original) throw new Error('The twice-applied unnormalized transform needs the reflected input.');

      expect(actual.re).toBeCloseTo(n * original.re, 9);
      expect(actual.im).toBeCloseTo(n * original.im, 9);
    }
  }

  const positiveImpulse = fftTrace([{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]);
  expect(positiveImpulse.output[1]?.re).toBeCloseTo(0, 14);
  expect(positiveImpulse.output[1]?.im).toBeCloseTo(1, 14);
});

test('130: every displayed butterfly joins one legal rail pair and carries its actual incoming and outgoing complex values', () => {
  for (const n of [2, 4, 8, 16, 32, 64, 128, 256]) {
    const trace = fftTrace(sampleSignal(n));
    expect(trace.columns).toHaveLength(Math.log2(n) + 1);
    expect(trace.stages).toHaveLength(Math.log2(n));
    expect(trace.butterflies).toBe(n / 2 * Math.log2(n));
    expect(new Set(trace.permutation).size).toBe(n);

    for (const [rail, originalIndex] of trace.permutation.entries()) {
      expect(trace.columns[0]?.[rail]).toEqual(trace.input[originalIndex]);
    }

    for (const stage of trace.stages) {
      const before = trace.columns[stage.level];
      const after = trace.columns[stage.level + 1];

      if (!before || !after) throw new Error('Each butterfly layer needs its actual value columns.');

      expect(stage.pairs).toHaveLength(n / 2);
      const covered = new Set<number>();

      for (const pair of stage.pairs) {
        const upperBefore = before[pair.upper];
        const lowerBefore = before[pair.lower];
        const upperAfter = after[pair.upper];
        const lowerAfter = after[pair.lower];

        if (!upperBefore || !lowerBefore || !upperAfter || !lowerAfter) throw new Error('Each butterfly must join two rails in both value columns.');

        expect(pair.lower - pair.upper).toBe(stage.span / 2);
        expect(Math.floor(pair.upper / stage.span)).toBe(Math.floor(pair.lower / stage.span));
        expect(covered.has(pair.upper)).toBe(false);
        expect(covered.has(pair.lower)).toBe(false);
        covered.add(pair.upper);
        covered.add(pair.lower);
        expect(pair.beforeUpper).toEqual(upperBefore);
        expect(pair.beforeLower).toEqual(lowerBefore);
        expect(pair.afterUpper).toEqual(upperAfter);
        expect(pair.afterLower).toEqual(lowerAfter);
        expect(pair.twiddle.re ** 2 + pair.twiddle.im ** 2).toBeCloseTo(1, 14);
        expect((pair.afterUpper.re + pair.afterLower.re) / 2).toBeCloseTo(pair.beforeUpper.re, 13);
        expect((pair.afterUpper.im + pair.afterLower.im) / 2).toBeCloseTo(pair.beforeUpper.im, 13);
        expect((pair.afterUpper.re - pair.afterLower.re) / 2).toBeCloseTo(pair.product.re, 13);
        expect((pair.afterUpper.im - pair.afterLower.im) / 2).toBeCloseTo(pair.product.im, 13);
      }

      expect(covered.size).toBe(n);
    }
  }

  const model = buildFourierModel();
  expect(model.traces.map(trace => trace.butterflies)).toEqual([12, 32, 80]);

  for (let index = 0; index < model.traces.length - 1; index++) {
    const smaller = model.traces[index];
    const larger = model.traces[index + 1];

    if (!smaller || !larger) throw new Error('The carried doubling needs both transform diagrams.');

    for (const [rail, originalIndex] of smaller.permutation.entries()) expect(larger.permutation[2 * rail]).toBe(originalIndex);
  }

  expect(() => fftTrace(sampleSignal(3))).toThrow();
});

test('130: stable saving factors match the high-precision logarithm and independent series oracle', () => {
  expect(THETA_DECIMAL).toBe(reference.thetaDecimal);
  expect(SAVING_EPSILON / reference.epsilon).toBeCloseTo(1, 15);
  expect(SAVING_EPSILON).toBeGreaterThan(1e-13);
  const model = buildFourierModel();
  expect(model.halfAtLnLnN / reference.halfAtLnLnN).toBeCloseTo(1, 15);
  expect(savingAtLnLn(model.halfAtLnLnN).drop).toBeCloseTo(.5, 15);
  expect(savingAtLnLn(0)).toEqual({ lnLnN: 0, drop: 0, factor: 1 });
  let previous = 0;

  for (const row of reference.rows) {
    const actual = savingAtLog2(Number(row.log2N));
    expect(actual.lnLnN).toBeCloseTo(row.lnLnN, 12);
    expect(actual.drop / row.drop).toBeCloseTo(1, 14);
    expect(actual.drop).toBeGreaterThan(previous);
    expect(actual.drop).toBeLessThan(1e-10);
    expect(actual.factor + actual.drop).toBeCloseTo(1, 15);
    previous = actual.drop;
  }

  expect(() => savingAtLog2(0)).toThrow();
  expect(() => savingAtLnLn(Infinity)).toThrow();
});
