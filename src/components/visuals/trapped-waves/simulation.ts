import { besselValues, type WaveFrame } from './math';

// e^(-itH), evaluated by a Chebyshev expansion with spectrum scaled into[-1,1].
export class WaveSimulation {
  private readonly side: number;
  private readonly scale: number;
  private readonly potential: Float64Array;
  private readonly real: Float64Array;
  private readonly imaginary: Float64Array;
  private readonly firstReal: Float64Array;
  private readonly firstImaginary: Float64Array;
  private readonly secondReal: Float64Array;
  private readonly secondImaginary: Float64Array;
  private readonly thirdReal: Float64Array;
  private readonly thirdImaginary: Float64Array;
  private readonly totalReal: Float64Array;
  private readonly totalImaginary: Float64Array;
  private time = 0;

  constructor(unit: Float64Array, disorder: number, side = 201) {
    if (unit.length !== side * side) throw new RangeError('The impurity array must fill the square grid.');

    this.side = side;
    this.scale = 4 + disorder + .01;
    this.potential = Float64Array.from(unit, value => value * disorder);
    this.real = new Float64Array(unit.length);
    this.imaginary = new Float64Array(unit.length);
    this.real[Math.floor(unit.length / 2)] = 1;
    this.firstReal = new Float64Array(unit.length);
    this.firstImaginary = new Float64Array(unit.length);
    this.secondReal = new Float64Array(unit.length);
    this.secondImaginary = new Float64Array(unit.length);
    this.thirdReal = new Float64Array(unit.length);
    this.thirdImaginary = new Float64Array(unit.length);
    this.totalReal = new Float64Array(unit.length);
    this.totalImaginary = new Float64Array(unit.length);
  }

  private apply(sourceReal: Float64Array, sourceImaginary: Float64Array, targetReal: Float64Array, targetImaginary: Float64Array): void {
    const side = this.side;

    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = y * side + x;
        let r = (this.potential[i] ?? 0) * (sourceReal[i] ?? 0);
        let im = (this.potential[i] ?? 0) * (sourceImaginary[i] ?? 0);

        if (y > 0) {
          r += sourceReal[i - side] ?? 0;
          im += sourceImaginary[i - side] ?? 0;
        }

        if (y + 1 < side) {
          r += sourceReal[i + side] ?? 0;
          im += sourceImaginary[i + side] ?? 0;
        }

        if (x > 0) {
          r += sourceReal[i - 1] ?? 0;
          im += sourceImaginary[i - 1] ?? 0;
        }

        if (x + 1 < side) {
          r += sourceReal[i + 1] ?? 0;
          im += sourceImaginary[i + 1] ?? 0;
        }

        targetReal[i] = r / this.scale;
        targetImaginary[i] = im / this.scale;
      }
    }
  }

  advance(step: number): void {
    const count = Math.floor(this.scale * step) + 40;
    const coefficients = besselValues(this.scale * step, count);
    let aReal = this.firstReal;
    let aImaginary = this.firstImaginary;
    let bReal = this.secondReal;
    let bImaginary = this.secondImaginary;
    let cReal = this.thirdReal;
    let cImaginary = this.thirdImaginary;
    aReal.set(this.real);
    aImaginary.set(this.imaginary);
    this.apply(aReal, aImaginary, bReal, bImaginary);
    const zeroth = coefficients[0] ?? 0;
    const first = 2 * (coefficients[1] ?? 0);

    for (let i = 0; i < this.real.length; i++) {
      this.totalReal[i] = zeroth * (aReal[i] ?? 0) + first * (bImaginary[i] ?? 0);
      this.totalImaginary[i] = zeroth * (aImaginary[i] ?? 0) - first * (bReal[i] ?? 0);
    }

    for (let order = 2; order < count; order++) {
      this.apply(bReal, bImaginary, cReal, cImaginary);
      const coefficient = 2 * (coefficients[order] ?? 0);
      const phase = order % 4;

      for (let i = 0; i < this.real.length; i++) {
        const r = 2 * (cReal[i] ?? 0) - (aReal[i] ?? 0);
        const im = 2 * (cImaginary[i] ?? 0) - (aImaginary[i] ?? 0);
        cReal[i] = r;
        cImaginary[i] = im;
        const phaseReal = phase === 0 ? r : phase === 1 ? im : phase === 2 ? -r : -im;
        const phaseImaginary = phase === 0 ? im : phase === 1 ? -r : phase === 2 ? -im : r;
        this.totalReal[i] = (this.totalReal[i] ?? 0) + coefficient * phaseReal;
        this.totalImaginary[i] = (this.totalImaginary[i] ?? 0) + coefficient * phaseImaginary;
      }

      [aReal, bReal, cReal] = [bReal, cReal, aReal];
      [aImaginary, bImaginary, cImaginary] = [bImaginary, cImaginary, aImaginary];
    }

    this.real.set(this.totalReal);
    this.imaginary.set(this.totalImaginary);
    this.time += step;
  }

  frame(cropSide = this.side): WaveFrame {
    const density = new Float32Array(cropSide * cropSide);
    const center = Math.floor(this.side / 2);
    const cropHalf = Math.floor(cropSide / 2);
    let norm = 0;
    let moment = 0;
    let within3 = 0;
    let within31 = 0;
    let edge = 0;

    for (let y = 0; y < this.side; y++) {
      for (let x = 0; x < this.side; x++) {
        const i = y * this.side + x;
        const probability = (this.real[i] ?? 0) ** 2 + (this.imaginary[i] ?? 0) ** 2;
        const dx = x - center;
        const dy = y - center;
        const squareDistance = dx * dx + dy * dy;
        const maximum = Math.max(Math.abs(dx), Math.abs(dy));
        norm += probability;
        moment += probability * squareDistance;

        if (squareDistance <= 9) within3 += probability;
        if (maximum <= 15) within31 += probability;
        if (maximum >= center - 3) edge += probability;
        if (maximum <= cropHalf) density[(dy + cropHalf) * cropSide + dx + cropHalf] = probability;
      }
    }

    return { time: this.time, side: cropSide, density, rms: Math.sqrt(moment), within3, within31, edge, norm };
  }
}
