
export function gcd(first: number, second: number): number {
  let a = Math.abs(first);
  let b = Math.abs(second);

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a;
}

// The net of c: every knot (a/c, b/c). The film tries nets c = 1, 2, 3… in turn over the view |x|, |y| ≤ NET_REACH.
export const NET_REACH = 2.6;

export type Knot = { a: number; b: number; c: number };

export function firstCatch(top: number, onCurve: (a: number, b: number, c: number) => boolean): Knot[] {
  for (let c = 1; c <= top; c += 1) {
    const reach = Math.floor(NET_REACH * c);
    const caught: Knot[] = [];

    for (let a = -reach; a <= reach; a += 1) {
      for (let b = -reach; b <= reach; b += 1) {
        if (onCurve(a, b, c)) caught.push({ a, b, c });
      }
    }

    if (caught.length > 0) return caught;
  }

  return [];
}

export const onCubic = (a: number, b: number, c: number): boolean => a ** 3 + b ** 3 === 6 * c ** 3;

export const onCircle = (a: number, b: number, c: number): boolean => a * a + b * b === 3 * c * c;

// x³ + y³ = 6 is first caught by the net of 21sts, at (17/21, 37/21) and (37/21, 17/21) (checked by the tests).
export const CUBIC_NET = 21;

export const CUBIC_KNOTS = [{ a: 17, b: 37, c: 21 }, { a: 37, b: 17, c: 21 }] as const satisfies readonly Knot[];

// x² + y² = 3 is never caught; the film's nets over it stop at 40ths.
export const CIRCLE_TOP = 40;

// The knot of the net of c, inside [left, right] × [bottom, top], nearest the circle x² + y² = 3 (by |a² + b² − 3c²|).
export function nearestMiss(c: number, left: number, right: number, bottom: number, top: number): Knot & { miss: number } {
  let best = { a: 0, b: 0, c, miss: Infinity };

  for (let a = Math.ceil(left * c); a <= Math.floor(right * c); a += 1) {
    for (let b = Math.ceil(bottom * c); b <= Math.floor(top * c); b += 1) {
      const miss = Math.abs(a * a + b * b - 3 * c * c) / (c * c);

      if (miss < best.miss) best = { a, b, c, miss };
    }
  }

  return best;
}

// The real curve x³ + y³ = 6.
export function cubicY(x: number): number {
  return Math.cbrt(6 - x ** 3);
}

// Remainders of n² on division by 3, for n = 0…8.
export const SQUARE_REMAINDERS = Array.from({ length: 9 }, (_, n) => (n * n) % 3);

// The small example: y² = x³ − 25x, with P = (−4, 6). Exact rational arithmetic in BigInt.
export type Rational = { num: bigint; den: bigint };

const EXAMPLE_A = -25n;

function reduce(num: bigint, den: bigint): Rational {
  let a = num < 0n ? -num : num;
  let b = den < 0n ? -den : den;

  while (b !== 0n) {
    [a, b] = [b, a % b];
  }

  const sign = den < 0n ? -1n : 1n;

  return { num: (sign * num) / a, den: (sign * den) / a };
}

const add = (p: Rational, q: Rational) => reduce(p.num * q.den + q.num * p.den, p.den * q.den);
const sub = (p: Rational, q: Rational) => reduce(p.num * q.den - q.num * p.den, p.den * q.den);
const mul = (p: Rational, q: Rational) => reduce(p.num * q.num, p.den * q.den);
const div = (p: Rational, q: Rational) => reduce(p.num * q.den, p.den * q.num);
const whole = (value: bigint): Rational => ({ num: value, den: 1n });

export type CurvePoint = { x: Rational; y: Rational };

// The chord (or tangent) rule: P + Q. The film never adds a point to its negative.
export function addPoints(p: CurvePoint, q: CurvePoint): CurvePoint {
  const same = p.x.num === q.x.num && p.x.den === q.x.den;
  const slope = same
    ? div(add(mul(whole(3n), mul(p.x, p.x)), whole(EXAMPLE_A)), mul(whole(2n), p.y))
    : div(sub(q.y, p.y), sub(q.x, p.x));
  const x = sub(sub(mul(slope, slope), p.x), q.x);

  return { x, y: sub(mul(slope, sub(p.x, x)), p.y) };
}

export const EXAMPLE_P: CurvePoint = { x: whole(-4n), y: whole(6n) };

export function onExampleCurve({ x, y }: CurvePoint): boolean {
  const left = mul(y, y);
  const right = add(mul(x, mul(x, x)), mul(whole(EXAMPLE_A), x));

  return left.num === right.num && left.den === right.den;
}

export function fractionText({ num, den }: Rational): string {
  const top = (num < 0n ? -num : num).toString();
  const sign = num < 0n ? '−' : '';

  return den === 1n ? `${sign}${top}` : `${sign}${top}/${den.toString()}`;
}

export type Multiple = { n: number; point: CurvePoint; digits: number; x: number; y: number };

const PLACES = 10n ** 20n;

// A fraction's value as a float, even when its numerator and denominator have thousands of digits.
function valueOf({ num, den }: Rational): number {
  return Number((num * PLACES) / den) / 1e20;
}

// nP for n = 1…count, exactly, with the size of x(nP) in digits: the longer of its numerator and denominator.
export function exactMultiples(count: number): Multiple[] {
  const multiples: Multiple[] = [];
  let point = EXAMPLE_P;

  for (let n = 1; n <= count; n += 1) {
    if (n > 1) point = addPoints(point, EXAMPLE_P);

    const top = point.x.num < 0n ? -point.x.num : point.x.num;
    const digits = Math.max(top.toString().length, point.x.den.toString().length);
    multiples.push({ n, point, digits, x: valueOf(point.x), y: valueOf(point.y) });
  }

  return multiples;
}

// nP for n = 1…count in double precision, by the same chord steps. Exact fractions grow like 0.83 n² digits, so the
// film's many dots use floats; the tests hold them to the exact points while those are cheap to compute.
export function floatMultiples(count: number): { n: number; x: number; y: number }[] {
  const points: { n: number; x: number; y: number }[] = [];
  let x = -4;
  let y = 6;

  for (let n = 1; n <= count; n += 1) {
    if (n > 1) {
      const slope = n === 2 ? (3 * x * x - 25) / (2 * y) : (y - 6) / (x + 4);
      const nextX = slope * slope - x + 4;
      y = slope * (x - nextX) - y;
      x = nextX;
    }

    points.push({ n, x, y });
  }

  return points;
}

// The points of finite order: (0, 0) and (±5, 0).
export const TORSION = [[-5, 0], [0, 0], [5, 0]] as const;

// The curve's two real pieces: the oval over −5 ≤ x ≤ 0, and the branch from x = 5 up to `reach`.
export function curvePieces(reach: number): { oval: [number, number][]; branch: [number, number][] } {
  const oval: [number, number][] = [];
  const branch: [number, number][] = [];
  const height = (x: number) => Math.sqrt(Math.max(0, x ** 3 - 25 * x));

  for (let index = 0; index <= 160; index += 1) {
    const x = -5 + 5 * (1 - Math.cos(Math.PI * index / 160)) / 2;
    oval.push([x, height(x)]);
  }

  for (let index = 160; index >= 0; index -= 1) {
    const x = -5 + 5 * (1 - Math.cos(Math.PI * index / 160)) / 2;
    oval.push([x, -height(x)]);
  }

  for (let index = 160; index >= -160; index -= 1) {
    const x = 5 + (reach - 5) * (index / 160) ** 2;
    branch.push([x, index < 0 ? -height(x) : height(x)]);
  }

  return { oval, branch };
}
