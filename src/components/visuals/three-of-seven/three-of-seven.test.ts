import { expect, test } from 'bun:test';
import { buildThreeOfSevenModel, type BasisFamily, type Complex } from './math';

function measuredOverlap(a: readonly Complex[], b: readonly Complex[]): number {
  // Polar coordinates give an independent evaluation of the complex dot product.
  let re = 0;
  let im = 0;

  for (let index = 0; index < a.length; index++) {
    const x = a[index];
    const y = b[index];

    if (!x || !y) throw new Error('Both measured vectors need every coordinate.');

    const magnitude = Math.hypot(x.re, x.im) * Math.hypot(y.re, y.im);
    const phase = Math.atan2(y.im, y.re) - Math.atan2(x.im, x.re);
    re += magnitude * Math.cos(phase);
    im += magnitude * Math.sin(phase);
  }

  return re * re + im * im;
}

function checkFamily(family: BasisFamily): void {
  for (const basis of family.bases) {
    for (let first = 0; first < basis.vectors.length; first++) {
      const a = basis.vectors[first];

      if (!a) throw new Error('Every basis needs all its vectors.');

      for (let second = 0; second < basis.vectors.length; second++) {
        const b = basis.vectors[second];

        if (!b) throw new Error('Every basis needs all its vectors.');

        expect(Math.abs(measuredOverlap(a, b) - Number(first === second))).toBeLessThan(1e-12);
      }
    }
  }

  for (const pair of family.pairs) {
    const first = family.bases[pair.first];
    const second = family.bases[pair.second];

    if (!first || !second) throw new Error('Every displayed pair needs its actual two bases.');

    for (let row = 0; row < pair.values.length; row++) {
      const a = first.vectors[row];
      const probabilities = pair.values[row];

      if (!a || !probabilities) throw new Error('Every table row needs its measured vector.');

      let sum = 0;

      for (let column = 0; column < probabilities.length; column++) {
        const b = second.vectors[column];
        const probability = probabilities[column];

        if (!b || probability === undefined) throw new Error('Each outcome needs its measured vector and probability.');

        expect(Math.abs(probability - measuredOverlap(a, b))).toBeLessThan(1e-12);
        expect(Math.abs(probability - 1 / family.dimension)).toBeLessThan(1e-12);
        sum += probability;
      }

      expect(Math.abs(sum - 1)).toBeLessThan(1e-12);
    }
  }
}

test('266: every constructed family has orthonormal bases and normalized uniform measurement tables', () => {
  const model = buildThreeOfSevenModel();

  for (const current of [model.stage2, model.stage3, model.six, ...model.primeFamilies]) checkFamily(current);
});

test('266: the six-level vectors and measurement probabilities factor into their two- and three-level systems', () => {
  const model = buildThreeOfSevenModel();

  for (let basis = 0; basis < model.six.bases.length; basis++) {
    const six = model.six.bases[basis];
    const two = model.stage2.bases[basis];
    const three = model.stage3.bases[basis];

    if (!six || !two || !three) throw new Error('Each tensor basis needs both factor bases.');

    for (let column = 0; column < six.vectors.length; column++) {
      const vector = six.vectors[column];
      const a = two.vectors[Math.floor(column / 3)];
      const b = three.vectors[column % 3];

      if (!vector || !a || !b) throw new Error('Each tensor column needs its factor vectors.');

      for (let row = 0; row < vector.length; row++) {
        const value = vector[row];
        const x = a[Math.floor(row / 3)];
        const y = b[row % 3];

        if (!value || !x || !y) throw new Error('Each tensor coordinate needs both factor coordinates.');

        const magnitude = Math.hypot(x.re, x.im) * Math.hypot(y.re, y.im);
        const angle = Math.atan2(x.im, x.re) + Math.atan2(y.im, y.re);
        expect(Math.hypot(value.re - magnitude * Math.cos(angle), value.im - magnitude * Math.sin(angle))).toBeLessThan(1e-12);
      }
    }
  }

  for (let index = 0; index < model.six.pairs.length; index++) {
    const six = model.six.pairs[index];
    const two = model.stage2.pairs[index];
    const three = model.stage3.pairs[index];

    if (!six || !two || !three) throw new Error('The tensor overlap pair needs the corresponding factor pairs.');

    for (let row = 0; row < six.values.length; row++) {
      for (let column = 0; column < six.values.length; column++) {
        const joint = six.values[row]?.[column];
        const first = two.values[Math.floor(row / 3)]?.[Math.floor(column / 3)];
        const second = three.values[row % 3]?.[column % 3];

        if (joint === undefined || first === undefined || second === undefined) throw new Error('Each joint probability needs both factor probabilities.');

        expect(Math.abs(joint - first * second)).toBeLessThan(1e-12);
      }
    }
  }
});
