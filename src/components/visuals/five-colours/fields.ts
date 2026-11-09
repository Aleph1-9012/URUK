import { smooth } from './story';

type Box = { x: number; y: number; w: number; h: number };

type Colors = { ink: string; blue: string; muted: string; paper: string };

type FillClass = (path: Path2D, classId: number, alpha?: number) => void;

type Label = (id: string, x: number, y: number, opacity?: number) => void;

type Point = { x: number; y: number };

const SAMPLES = Array.from({ length: 84 }, (_, index) => ({
  x: ((index * 37) % 101) / 101,
  y: ((index * 61 + 7) % 103) / 103,
  classId: 1 + (index * 17 + Math.floor(index / 7)) % 5,
}));

export function focusPose(box: Box): { x: number; y: number; unit: number } {
  return { x: box.x + .5 * box.w, y: box.y + .5 * box.h, unit: Math.min(.28 * box.w, .40 * box.h) };
}

export function drawColourFields(
  ctx: CanvasRenderingContext2D,
  box: Box,
  time: number,
  colors: Colors,
  fillClass: FillClass,
  labelCallback: Label,
): void {
  if (time < 61500 || time >= 115000) return;

  const phone = box.w < 360;
  const point = (x: number, y: number): Point => ({ x: box.x + x * box.w, y: box.y + y * box.h });
  const focus = focusPose(box);

  function stroke(points: readonly Point[], tone: keyof Colors = 'ink', weight = 1): void {
    if (points.length < 2) return;

    ctx.beginPath();

    for (const [index, p] of points.entries()) {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }

    ctx.strokeStyle = colors[tone];
    ctx.lineWidth = weight;
    ctx.stroke();
  }

  function tag(text: string, x: number, y: number, maxWidth: number, tone: keyof Colors = 'ink'): void {
    const size = phone ? 10 : 11;
    ctx.font = `${size}px "Special Elite", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines: string[] = [];
    let current = '';

    for (const word of text.split(' ')) {
      const next = current ? `${current} ${word}` : word;

      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current);
        current = word;
      } else current = next;
    }

    lines.push(current);

    for (const [index, value] of lines.entries()) {
      const extent = ctx.measureText(value).width;
      const px = Math.max(box.x + extent / 2 + 4, Math.min(box.x + box.w - extent / 2 - 4, x));
      const py = y + (index - (lines.length - 1) / 2) * (size + 3);
      ctx.fillStyle = colors.paper;
      ctx.fillRect(px - extent / 2 - 3, py - size * .7, extent + 6, size * 1.4);
      ctx.fillStyle = colors[tone];
      ctx.fillText(value, px, py);
    }
  }

  function clip(rect: Box, draw: () => void): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, Math.max(0, rect.w), Math.max(0, rect.h));
    ctx.clip();
    draw();
    ctx.restore();
  }

  function paper(rect: Box): void {
    ctx.fillStyle = colors.paper;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  function wild(rect: Box): void {
    const columns = phone ? 20 : 26;
    const rows = phone ? 12 : 18;
    const cw = rect.w / columns;
    const ch = rect.h / rows;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const index = row * columns + column;
        const path = new Path2D();
        path.rect(rect.x + column * cw, rect.y + row * ch, cw + .5, ch + .5);
        fillClass(path, 1 + (index * 73 + row * 11 + Math.floor(index / 3)) % 5);
      }
    }
  }

  function tame(rect: Box): void {
    const meeting = { x: rect.x + .72 * rect.w, y: rect.y + .28 * rect.h };
    const radius = Math.hypot(rect.w, rect.h);

    for (let region = 0; region < 5; region++) {
      const path = new Path2D();
      path.moveTo(meeting.x, meeting.y);
      path.arc(meeting.x, meeting.y, radius, region * Math.PI * 2 / 5, (region + 1) * Math.PI * 2 / 5);
      path.closePath();
      fillClass(path, region + 1);
    }
  }

  function averaged(rect: Box): void {
    const columns = phone ? 20 : 30;
    const rows = phone ? 12 : 18;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const x = column / columns;
        const y = row / rows;
        const amount = .25 + .45 * (.5 + .5 * Math.sin(7 * x + Math.cos(5 * y)));
        const path = new Path2D();
        path.rect(rect.x + x * rect.w, rect.y + y * rect.h, rect.w / columns + .6, rect.h / rows + .6);
        fillClass(path, 1, amount);
      }
    }
  }

  function waveLines(rect: Box, progress = 1): void {
    for (let level = 0; level < 6; level++) {
      const points: Point[] = [];

      for (let step = 0; step <= 90 * progress; step++) {
        const x = step / 90;
        const y = (level + 1) / 7 + .055 * Math.sin(7 * x + level * .8);
        points.push({ x: rect.x + rect.w * x, y: rect.y + rect.h * y });
      }

      stroke(points, 'ink', .85);
    }
  }

  function sectors(inner: boolean): void {
    const count = inner ? 3 : 6;
    const radius = inner ? focus.unit : Math.hypot(box.w, box.h);

    for (let sector = 0; sector < count; sector++) {
      const path = new Path2D();
      const a = sector * Math.PI * 2 / count - Math.PI / 2;
      const b = (sector + 1) * Math.PI * 2 / count - Math.PI / 2;
      path.moveTo(focus.x, focus.y);
      path.arc(focus.x, focus.y, radius, a, b);
      path.closePath();
      fillClass(path, inner ? sector + 1 : 4 + sector % 2);
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();

  if (time < 79000) {
    const wipe = smooth(time, 61500, 63500);
    clip({ ...box, w: box.w * wipe }, () => wild(box));
    const divide = time < 70500 ? 1 - .5 * smooth(time, 65000, 68500) : .5 * (1 - smooth(time, 70500, 73500));
    clip({ x: box.x + divide * box.w, y: box.y, w: (1 - divide) * box.w, h: box.h }, () => tame(box));

    if (time < 70500) {
      tag('WILD', box.x + box.w * .25, box.y + 14, box.w * .4);

      if (time >= 65000) {
        tag('TAME', box.x + box.w * .75, box.y + 14, box.w * .4);
        const a = point(.42, .5);
        const b = point(.58, .5);
        stroke([a, b], 'blue', 2);
        stroke([{ x: b.x - 5, y: b.y - 4 }, b, { x: b.x - 5, y: b.y + 4 }], 'blue', 2);
      }
    } else {
      tag('WEAK MEASURABLE COLOURING', box.x + box.w / 2, box.y + 14, box.w - 12);
      tag('NEGLIGIBLE EXCEPTIONS ALLOWED', box.x + box.w / 2, box.y + box.h - 31, box.w - 12);

      if (time >= 76000) {
        const progress = smooth(time, 76000, 77500);
        const from = point(.15, .78);
        const to = point(.85, .18);
        stroke([from, { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress }], 'blue', 2);
        tag('STEP 2: NO TAME FIVE-COLOURING', box.x + box.w / 2, box.y + box.h * .5, box.w - 12, 'blue');
      }
    }
  } else if (time < 87500) {
    paper(box);
    const clearing = smooth(time, 79000, 81000);
    clip({ ...box, h: box.h * (1 - clearing) }, () => tame(box));
    const copies = Math.min(6, 1 + Math.floor(Math.max(0, time - 81000) / 550));
    const stacking = smooth(time, 81000, 84000);
    const averageReveal = smooth(time, 84000, 86700);

    for (let copy = 0; copy < copies; copy++) {
      const angle = (copy - 2.5) * Math.PI / 10 * (1 - stacking);
      const cs = Math.cos(angle);
      const sn = Math.sin(angle);
      const shift = (copy - 2.5) * .045 * (1 - stacking);

      for (const sample of SAMPLES) {
        const px = (sample.x - .5) * .8;
        const py = (sample.y - .5) * .72;
        const x = .5 + px * cs - py * sn + shift;
        const y = .5 + px * sn + py * cs;
        const at = point(x, y);
        const path = new Path2D();
        path.arc(at.x, at.y, phone ? 1.5 : 2.1, 0, Math.PI * 2);
        fillClass(path, sample.classId);
      }
    }

    clip({ ...box, h: box.h * averageReveal }, () => {
      paper(box);
      averaged(box);
    });
    tag(time < 84000 ? 'ALGEBRAIC COORDINATES · A SAMPLE' : 'HOW OFTEN COLOUR 1 APPEARS', box.x + box.w / 2, box.y + 14, box.w - 12);

    if (time >= 81000 && time < 84000) tag('SHIFT · ROTATE · AVERAGE', box.x + box.w / 2, box.y + box.h - 31, box.w - 12, 'blue');
  } else if (time < 96000) {
    paper(box);
    const split = smooth(time, 87500, 89000);
    const top = { x: box.x, y: box.y + 26 * split, w: box.w, h: box.h * (1 - .63 * split) };
    const lower = { x: box.x, y: box.y + box.h * (1 - .47 * split), w: box.w, h: box.h * .37 * split };
    const departure = smooth(time, 92500, 95000);
    const expand = smooth(time, 94000, 96000);
    averaged(top);
    waveLines({ ...top, h: top.h + box.h * .48 * expand });

    if (expand < .8) {
      labelCallback('waves', box.x + box.w / 2, box.y + 40);
      tag('SMOOTH WAVES', box.x + box.w / 2, box.y + 14, box.w - 12);
    }

    if (departure < 1 && split > .005) {
      const moving = { ...lower, y: lower.y + box.h * departure };
      const uniform = smooth(time, 90200, 92400);
      const rows = phone ? 6 : 9;
      const columns = phone ? 20 : 26;

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = row * columns + column;
          const path = new Path2D();
          path.rect(moving.x + column / columns * moving.w, moving.y + row / rows * moving.h, moving.w / columns + .5, moving.h / rows + .5);
          fillClass(path, index / (rows * columns) < uniform ? 1 : 1 + (index * 73 + row * 11) % 5);
        }
      }

      if (split > .5) tag(time < 92400 ? 'WILD REMAINDER' : 'UNIFORM · DROPPED', moving.x + moving.w / 2, moving.y + moving.h / 2, moving.w - 12);
    }

    if (expand > 0) clip({ ...box, w: box.w * expand }, () => tame(box));
    if (expand >= .8) tag('TAME COLOURING', box.x + box.w / 2, box.y + 14, box.w - 12);
  } else {
    paper(box);
    const zoom = smooth(time, 96000, 98000);
    const meeting = { x: box.x + box.w * (.72 - .22 * zoom), y: box.y + box.h * (.28 + .22 * zoom) };

    if (time < 105500) {
      for (let sector = 0; sector < 5; sector++) {
        const path = new Path2D();
        path.moveTo(meeting.x, meeting.y);
        path.arc(meeting.x, meeting.y, Math.hypot(box.w, box.h), sector * Math.PI * 2 / 5, (sector + 1) * Math.PI * 2 / 5);
        path.closePath();
        fillClass(path, sector + 1);
      }
    } else {
      sectors(false);
      sectors(true);
    }

    const circle = smooth(time, 96500, 98800);
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, focus.unit, -.5 * Math.PI, -.5 * Math.PI + 2 * Math.PI * circle);
    ctx.strokeStyle = colors.blue;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    if (time < 105500) {
      for (let direction = 0; direction < 8; direction++) {
        if (direction / 8 > circle) continue;

        const angle = direction * Math.PI / 4;
        const x = focus.x + Math.cos(angle) * (focus.unit + 8);
        const y = focus.y + Math.sin(angle) * (focus.unit + 8);
        const size = phone ? 5 : 7;

        for (let item = 0; item < 2; item++) {
          const path = new Path2D();
          path.rect(x + (item - 1) * size, y - size / 2, size, size);
          fillClass(path, 1 + (direction + item) % 5);
        }
      }

      tag(phone ? 'AT MOST TWO PER DIRECTION' : 'AT MOST TWO COLOURS PER DIRECTION', box.x + box.w / 2, box.y + 14, box.w - 12);
    } else {
      tag(time < 110000 ? 'THREE COLOURS INSIDE · TWO OUTSIDE' : 'ONLY THREE HERE · SPINDLE NEEDS FOUR', box.x + box.w / 2, box.y + 14, box.w - 12);
    }
  }

  tag('SCHEMATIC', box.x + box.w / 2, box.y + box.h - 12, box.w - 12, 'muted');
  ctx.restore();
}
