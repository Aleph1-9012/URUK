import { smooth } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText, drawWrappedText } from './drawing';
import type { PolarModel } from './math';

export function drawDimensions(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, ink: string, paper: string, blue: string, dimensions: PolarModel['dimensionTable']): void {
  if (time < 36750) return;

  const tall = width < PHONE_STAGE_WIDTH;
  const compact = width < 880;
  const size = tall ? 8.5 : compact ? 10.5 : 12;
  const left = width * .535;
  const right = width * .97;
  const available = right - left;
  const centre = (left + right) / 2;
  const top = height * .10;
  const rowGap = tall ? 16 : compact ? 19 : 25;
  const first = top + (tall ? 35 : compact ? 43 : 54);
  const last = first + rowGap * 3;
  drawText(ctx, 'CUBE PRODUCTS', centre, top + 3, { size, color: ink, paper });
  drawText(ctx, 'n', left + available * .15, top + (tall ? 18 : 27), { size: size + 3, color: ink, family: 'math', paper });
  drawText(ctx, '4ⁿ/n!', left + available * .64, top + (tall ? 18 : 27), { size: size + 3, color: ink, family: 'math', paper });

  for (const [index, row] of dimensions.entries()) {
    const y = first + index * rowGap;
    drawText(ctx, String(row.n), left + available * .15, y, { size: size + 3, color: ink, family: 'math', paper });
    drawText(ctx, row.productFraction, left + available * .64, y, { size: size + 4, color: ink, family: 'math', paper });
  }

  drawText(ctx, 'n ≤ 3: KNOWN', centre, last + (tall ? 17 : 19), { size: size + .5, color: ink, family: 'math', paper });
  const extension = smooth(time, 36750, 37950);
  const bracketX = right - 1;
  const bracketTop = first - 8;
  const bracketBottom = last + 7;
  const bracketY = bracketTop + (bracketBottom - bracketTop) * extension;
  drawLine(ctx, bracketX - 6, bracketTop, bracketX, bracketTop, blue, tall ? 1.5 : 2);
  drawLine(ctx, bracketX, bracketTop, bracketX, bracketY, blue, tall ? 1.5 : 2);

  if (extension === 1) {
    drawLine(ctx, bracketX, bracketBottom, bracketX - 6, bracketBottom, blue, tall ? 1.5 : 2);
    const continuation = smooth(time, 37950, 38950);
    drawLine(ctx, bracketX, bracketBottom + 4, bracketX, bracketBottom + 4 + 13 * continuation, blue, tall ? 1.5 : 2, [2, 3]);
  }

  const claimY = last + (tall ? 34 : 40);
  drawText(ctx, 'CLAIMED: ALL n ≥ 1', centre, claimY, { size: size + .5, color: ink, family: 'math', paper });
  const inequalityY = claimY + (tall ? 16 : 21);
  drawText(ctx, 'PRODUCT ≥ 4ⁿ/n!', centre, inequalityY, { size: size + .5, color: ink, family: 'math', paper });
  const scope = drawWrappedText(ctx, 'EVERY ORIGIN-SYMMETRIC CONVEX BODY', centre, inequalityY + (tall ? 11 : 15), available, { size, color: ink, paper });
  drawWrappedText(ctx, 'EQUALITY: LINEAR IMAGES OF HANNER POLYTOPES', centre, scope.y + scope.height + (tall ? 5 : 8), available, { size, color: ink, paper });
}

export function drawLedger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, ink: string, paper: string, _blue: string): void {
  if (time < 44750) return;

  const tall = width < PHONE_STAGE_WIDTH;
  const size = tall ? 8.5 : width < 880 ? 10.5 : 12;
  const centre = width / 2;
  const available = width * .92;
  drawLine(ctx, width * .045, height * .814, width * .955, height * .814, ink, .7);
  drawText(ctx, 'UNREVIEWED', centre, height * .842, { size: size + 3, color: ink, paper });
  drawText(ctx, '18 OCTOBER 2026', centre, height * .875, { size, color: ink, paper });

  if (time >= 51000) {
    drawText(ctx, 'LEAN: 3 STATEMENTS IN THE CATALOGUE', centre, height * .910, { size, color: ink, paper });
    drawText(ctx, 'GENERAL STATEMENT: UNCATALOGUED', centre, height * .943, { size, color: ink, paper });
    drawText(ctx, 'KERNEL CHECK IS NOT HUMAN REVIEW', centre, height * .976, { size, color: ink, paper });
  } else drawWrappedText(ctx, 'NO PUBLIC HUMAN CHECK OF THE PROOFS', centre, height * .915, available, { size, color: ink, paper });
}
