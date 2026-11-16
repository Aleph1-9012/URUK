import { smooth } from '../../../lib/animation';
import { PHONE_STAGE_WIDTH } from '../../plate/frame';
import { drawLine, drawText } from '../../plate/canvas/wrapped-text';

export function drawLedger(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, ink: string, paper: string): void {
  if (time < 59500) return;

  const tall = width < PHONE_STAGE_WIDTH;
  const size = tall ? 8.5 : width < 880 ? 10.5 : 12;
  const top = height * (tall ? .80 : .73);
  const cardHeight = height * .99 - top;
  const travel = (height - top + 10) * (1 - smooth(time, 59500, 60750));
  const cardTop = top + travel;
  const centre = width / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, width, height - top);
  ctx.clip();
  ctx.fillStyle = paper;
  ctx.fillRect(width * .035, cardTop, width * .93, cardHeight + 3);
  drawLine(ctx, width * .045, cardTop + 1, width * .955, cardTop + 1, ink, .7);
  drawText(ctx, 'UNREVIEWED', centre, cardTop + cardHeight * .13, { size: size + 3, color: ink });
  drawText(ctx, '20 OCTOBER 2026', centre, cardTop + cardHeight * .31, { size, color: ink });

  if (time >= 64500) {
    drawText(ctx, 'LEAN: ONE CATALOGUED STATEMENT', centre, cardTop + cardHeight * .48, { size, color: ink });
    drawText(ctx, 'BOUND AND ATTAINMENT', centre, cardTop + cardHeight * .62, { size, color: ink, family: 'serif' });
    drawText(ctx, 'CLUSTERING CONSEQUENCE: NOT COVERED', centre, cardTop + cardHeight * .76, { size, color: ink });
    drawText(ctx, 'KERNEL CHECK IS NOT A HUMAN READING', centre, cardTop + cardHeight * .90, { size, color: ink });
  }

  ctx.restore();
}
