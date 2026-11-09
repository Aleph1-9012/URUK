// ζ and Dirichlet L-functions, evaluated numerically for drawing.
// Hurwitz zeta by Euler–Maclaurin (NIST DLMF 25.2.9 and 25.11.5); L(s, χ) = q^(−s) Σ χ(a) ζ(s, a/q).
// Accurate to about 1e−9 for −7 ≤ Re s ≤ 3 and |Im s| ≤ 70; the remainder is not certified.

export type Complex = { re: number; im: number };

const DIRECT_TERMS = 32;

// B₂, B₄, …, B₂₈.
const BERNOULLI = [
  1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6, -3617 / 510, 43867 / 798, -174611 / 330,
  854513 / 138, -236364091 / 2730, 8553103 / 6, -23749461029 / 870,
] as const;

// B₂ⱼ/(2j)!
const bernoulliOverFactorial = BERNOULLI.map((bernoulli, index) => {
  let factorial = 1;

  for (let factor = 2; factor <= 2 * (index + 1); factor += 1) {
    factorial *= factor;
  }

  return bernoulli / factorial;
});

function multiply(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

function divide(a: Complex, b: Complex): Complex {
  const size = b.re * b.re + b.im * b.im;

  return { re: (a.re * b.re + a.im * b.im) / size, im: (a.im * b.re - a.re * b.im) / size };
}

// base^(−s) for a real base > 0.
function power(base: number, real: number, imaginary: number): Complex {
  const logarithm = Math.log(base);
  const size = Math.exp(-real * logarithm);
  const turn = -imaginary * logarithm;

  return { re: size * Math.cos(turn), im: size * Math.sin(turn) };
}

export function hurwitz(real: number, imaginary: number, shift: number): Complex {
  if (real === 1 && imaginary === 0) {
    throw new RangeError('The Hurwitz zeta function has a pole at s = 1.');
  }

  const total = { re: 0, im: 0 };

  for (let k = 0; k < DIRECT_TERMS; k += 1) {
    const term = power(k + shift, real, imaginary);
    total.re += term.re;
    total.im += term.im;
  }

  const end = DIRECT_TERMS + shift;
  const tail = divide(power(end, real - 1, imaginary), { re: real - 1, im: imaginary });
  const half = power(end, real, imaginary);
  total.re += tail.re + half.re / 2;
  total.im += tail.im + half.im / 2;
  let rising: Complex = { re: real, im: imaginary };

  for (const [index, coefficient] of bernoulliOverFactorial.entries()) {
    const order = 2 * index + 1;
    const term = multiply(rising, power(end, real + order, imaginary));
    total.re += coefficient * term.re;
    total.im += coefficient * term.im;
    rising = multiply(multiply(rising, { re: real + order, im: imaginary }), { re: real + order + 1, im: imaginary });
  }

  return total;
}

// A Dirichlet character by its values on 0, 1, …, q − 1.
export type Character = { name: string; modulus: number; values: readonly Complex[] };

function real(values: readonly number[]): Complex[] {
  return values.map((value) => ({ re: value, im: 0 }));
}

export const principal: Character = { name: '1', modulus: 1, values: real([1]) };

export const minusFour: Character = { name: '−4', modulus: 4, values: real([0, 1, 0, -1]) };

export function lValue(character: Character, realPart: number, imaginary: number): Complex {
  const q = character.modulus;

  if (q === 1) return hurwitz(realPart, imaginary, 1);

  const total = { re: 0, im: 0 };

  for (let a = 1; a < q; a += 1) {
    const value = character.values[a];

    if (!value || (value.re === 0 && value.im === 0)) continue;

    const term = multiply(value, hurwitz(realPart, imaginary, a / q));
    total.re += term.re;
    total.im += term.im;
  }

  return multiply(power(q, realPart, imaginary), total);
}
