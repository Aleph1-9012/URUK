import { mix, progress, smooth } from '../../../lib/animation';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, hatch, line, note } from './drawing';
import { buildDistanceModel, type Point } from './math';

type CloudFrame = { points: Point[]; moving: boolean; patch: number; dust: number; lattice: boolean; random: boolean };

type BarFrame = { positions: number[]; moving: boolean; squared: boolean; dust: number; continuum: number };

function pairClock(time: number): number {
  if (time < 2000) return progress(time, 850, 2000);
  if (time < 2650) return 1 + progress(time, 2000, 2650);

  return 2 + 64 * progress(time, 2650, 5500);
}

function morph(from: Point[], to: Point[], amount: number): Point[] {
  if (amount <= 0) return from;
  if (amount >= 1) return to;

  return Array.from({ length: Math.max(from.length, to.length) }, (_, index) => {
    const a = from[index % from.length];
    const b = to[index % to.length];

    if (!a || !b) throw new Error('A point morph needs both nonempty point lists.');

    return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
  });
}

function carried(from: number[], to: number[], amount: number): number[] {
  if (amount <= 0) return from;
  if (amount >= 1) return to;

  return Array.from({ length: Math.max(from.length, to.length) }, (_, index) => {
    const a = from[index % from.length];
    const b = to[index % to.length];

    if (a === undefined || b === undefined) throw new Error('A carried bar needs two nonempty exact lists.');

    return mix(a, b, amount);
  });
}

export class DustReachFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly model = buildDistanceModel();
  private colors: Colors = PAGE_TONES;
  private readonly patchPoints = this.model.patch.points.map(point => ({ x: point.x + .35, y: point.y + .35 }));
  private readonly openingPositions = this.model.opening.pairs.map(pair => pair.distance / Math.SQRT2).sort((a, b) => a - b);
  private readonly dustPositions = this.model.dusts.map(dust => dust.hitBins.map(bin => (bin + .5) * dust.delta / Math.SQRT2));
  private readonly latticePositions = this.model.lattice.hitBins.map(bin => bin / (2 * this.model.lattice.N ** 2));
  private readonly randomPositions = this.model.random.hitBins.map(bin => (bin + .5) * this.model.random.delta / 2);

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.colors = tones;

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { pen, colors, width: w, height: h } = this;
    const tall = w < PHONE_STAGE_WIDTH;
    const small = tall ? 9 : 13;
    const ladder = smooth(time, 20500, 22250);
    const squareSize = tall ? w * .42 : Math.min(w * .40, h * .64);
    const square: Box = { x: mix((w - squareSize) / 2, w * .055, ladder), y: tall ? h * .09 : h * .10, w: squareSize, h: squareSize };
    const bar: Box = { x: w * .085, y: h * (tall ? .61 : .80), w: w * .83, h: tall ? 18 : 22 };
    const frame = this.cloudAt(time);
    const barFrame = this.barAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineJoin = 'round';
    pen.lineCap = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.window(square, frame, time, tall);

    if (time < 6000) this.pairs(square, bar, time, tall);
    else this.distanceBar(bar, barFrame, time, tall);

    if (ladder > 0) this.thresholds(square, ladder, time, tall);

    const middleX = tall ? w / 2 : w * .84;
    const middleW = tall ? w - 26 : w * .27;
    const middleY = tall ? h * .455 : h * .61;
    const setY = tall ? h * .47 : (square.y + square.h + bar.y - 3) / 2;
    const moving = frame.moving || barFrame.moving;

    if (time < 6000) {
      const count = Math.min(66, Math.floor(pairClock(time)));
      note(pen, `12 POINTS · ${count} OF 66 PAIRS`, w / 2, setY, w - 25, small, colors.ink);
    } else if (time < 10000) {
      note(pen, 'SOLID SQUARE · SIDE 0.30', w / 2, setY, w - 25, small, colors.ink);
      note(pen, 'CONTINUUM: ZERO TO THE DIAGONAL', w / 2, tall ? h * .78 : h * .92, w - 24, small, colors.ink);
      note(pen, '41 BY 41 SAMPLE CHECK IS SEPARATE', w / 2, tall ? h * .86 : h * .97, w - 24, small - 1, colors.muted);

      if (moving) note(pen, 'POINTS AND BAR IN TRANSIT · SCHEMATIC', w / 2, h * (tall ? .96 : .62), w - 24, small - 1, colors.ink);
    } else if (time < 14500) {
      note(pen, moving ? 'RETURNING TO 12 POINTS · SCHEMATIC' : '12 POINTS · AT MOST 66 DISTANCES', w / 2, setY, w - 25, small, colors.ink);
      this.labels.place('pair-count', w / 2, h * (tall ? .79 : .94));
      note(pen, 'ERDŐS ASKED HOW FEW · GUTH–KATZ 2010', w / 2, tall ? h * .91 : h * .98, w - 24, small, colors.ink, 'Alegreya');
    } else if (time < 50750) {
      const dust = this.model.dusts[frame.dust];

      if (!dust) throw new Error('The displayed dust has one declared sample.');

      note(pen, `${moving ? 'TARGET LIMIT' : 'LIMIT'} DIMENSION ${dust.dimension.toFixed(3)}`, middleX, middleY, middleW, small, colors.ink);
      const info = moving ? 'POINTS AND BAR IN TRANSIT · SCHEMATIC' : `${dust.points.length.toLocaleString('en-US')} POINTS · ${dust.hitBins.length} OF ${dust.totalBins} CELLS HIT`;
      note(pen, info, w / 2, h * (tall ? .77 : .91), w - 25, small, colors.ink);

      if (!moving) note(pen, `${(100 * dust.hitBins.length / dust.totalBins).toFixed(1)}% · COMMON CELL SIZE 0.0105`, w / 2, h * (tall ? .84 : .96), w - 24, small, colors.ink);

      note(pen, 'FINITE BIN COVERAGE IS NOT LENGTH', w / 2, h * (tall ? .94 : .99), w - 25, small - 1, colors.ink);
    } else if (time < 60750) {
      note(pen, moving ? 'POINTS AND METRIC IN TRANSIT · SCHEMATIC' : '961 POINTS · SAME BINS FOR BOTH SETS', tall ? w / 2 : middleX, h * (tall ? .49 : .61), tall ? w - 25 : middleW, small, colors.ink);
      note(pen, 'ONE SCALE · NOT THE ITERATED CONSTRUCTION', w / 2, h * (tall ? .96 : .98), w - 24, small - 1, colors.ink);
    } else {
      this.claim(bar, time, tall, moving);
    }

    this.labels.endFrame();
  }

  private cloudAt(time: number): CloudFrame {
    const opening = this.model.opening.points;
    const [low, middle, high] = this.model.dusts;

    if (!low || !middle || !high) throw new Error('Three product Cantor samples are declared.');

    if (time < 6000) return { points: opening, moving: false, patch: 0, dust: 0, lattice: false, random: false };
    if (time < 10000) {
      const amount = smooth(time, 6000, 7200);

      return { points: morph(opening, this.patchPoints, amount), moving: amount < 1, patch: smooth(time, 6700, 7350), dust: 0, lattice: false, random: false };
    }

    if (time < 14500) {
      const amount = smooth(time, 10000, 11100);

      return { points: morph(this.patchPoints, opening, amount), moving: amount < 1, patch: 1 - smooth(time, 10000, 10800), dust: 0, lattice: false, random: false };
    }

    if (time < 16500) {
      const amount = smooth(time, 14500, 15650);

      return { points: morph(opening, low.points, amount), moving: amount < 1, patch: 0, dust: 0, lattice: false, random: false };
    }

    if (time < 18350) {
      const amount = smooth(time, 16500, 17400);

      return { points: morph(low.points, middle.points, amount), moving: amount < 1, patch: 0, dust: 1, lattice: false, random: false };
    }

    if (time < 42000) {
      const amount = smooth(time, 18350, 19400);

      return { points: morph(middle.points, high.points, amount), moving: amount < 1, patch: 0, dust: 2, lattice: false, random: false };
    }

    if (time < 50750) {
      const amount = smooth(time, 42000, 43400);

      return { points: morph(high.points, middle.points, amount), moving: amount < 1, patch: 0, dust: 1, lattice: false, random: false };
    }

    if (time < 55500) {
      const amount = smooth(time, 50750, 52900);

      return { points: morph(middle.points, this.model.lattice.points, amount), moving: amount < 1, patch: 0, dust: 1, lattice: true, random: false };
    }

    if (time < 60750) {
      const amount = smooth(time, 55500, 57300);

      return { points: morph(this.model.lattice.points, this.model.random.points, amount), moving: amount < 1, patch: 0, dust: 1, lattice: false, random: true };
    }

    const amount = smooth(time, 60750, 62400);

    return { points: morph(this.model.random.points, high.points, amount), moving: amount < 1, patch: 0, dust: 2, lattice: false, random: false };
  }

  private barAt(time: number): BarFrame {
    const [low, middle, high] = this.dustPositions;

    if (!low || !middle || !high) throw new Error('Every dust has computed occupied cells.');

    const patch = Array.from({ length: 86 }, (_, index) => index / 85 * .3);
    let positions: number[];
    let moving = false;
    let dust = 0;
    let squared = false;
    let continuum = 0;

    if (time < 10000) {
      const amount = smooth(time, 6000, 7350);
      positions = carried(this.openingPositions, patch, amount);
      moving = amount < 1;
      continuum = amount;
    } else if (time < 14500) {
      const amount = smooth(time, 10000, 11100);
      positions = carried(patch, this.openingPositions, amount);
      moving = amount < 1;
      continuum = 1 - amount;
    } else if (time < 16500) {
      const amount = smooth(time, 14500, 15650);
      positions = carried(this.openingPositions, low, amount);
      moving = amount < 1;
    } else if (time < 18350) {
      const amount = smooth(time, 16500, 17400);
      positions = carried(low, middle, amount);
      moving = amount < 1;
      dust = 1;
    } else if (time < 42000) {
      const amount = smooth(time, 18350, 19400);
      positions = carried(middle, high, amount);
      moving = amount < 1;
      dust = 2;
    } else if (time < 50750) {
      const amount = smooth(time, 42000, 43400);
      positions = carried(high, middle, amount);
      moving = amount < 1;
      dust = 1;
    } else if (time < 55500) {
      const amount = smooth(time, 50750, 52900);
      const squaredDust = middle.map(position => position ** 2);
      const metric = smooth(time, 50750, 51650);
      positions = carried(carried(middle, squaredDust, metric), this.latticePositions, amount);
      moving = amount < 1;
      squared = true;
    } else if (time < 60750) {
      const collapse = smooth(time, 59500, 60750);
      positions = carried(this.latticePositions, this.randomPositions, collapse);
      moving = collapse > 0 && collapse < 1;
      squared = true;
    } else {
      const amount = smooth(time, 60750, 62400);
      positions = carried(this.randomPositions, high, amount);
      moving = amount < 1;
      dust = 2;
    }

    return { positions, moving, squared, dust, continuum };
  }

  private window(box: Box, frame: CloudFrame, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const size = tall ? 9 : 13;
    const entrance = smooth(time, 0, 650);
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .8;
    pen.strokeRect(box.x, box.y, box.w * entrance, box.h * entrance);
    const inset = 2;
    const map = (point: Point): Point => ({ x: box.x + inset + point.x * (box.w - 2 * inset), y: box.y + box.h - inset - point.y * (box.h - 2 * inset) });
    pen.fillStyle = colors.ink;
    pen.beginPath();
    const radius = frame.points.length <= 12 ? (tall ? 1.9 : 2.8) * smooth(time, 200, 950) : Math.max(.55, 1 / this.density);

    for (const point of frame.points) {
      const pin = map(point);
      pen.moveTo(pin.x + radius, pin.y);
      pen.arc(pin.x, pin.y, radius, 0, 2 * Math.PI);
    }

    pen.fill();

    if (frame.patch > 0) {
      const side = .3 * (box.w - 4) * frame.patch;
      const patch = { x: box.x + box.w / 2 - side / 2, y: box.y + box.h / 2 - side / 2, w: side, h: side };
      pen.fillStyle = colors.paper;
      pen.fillRect(patch.x, patch.y, patch.w, patch.h);
      hatch(pen, patch, colors.ink, tall ? 3 : 5);
      pen.strokeStyle = colors.ink;
      pen.strokeRect(patch.x, patch.y, patch.w, patch.h);
    }

    let label = 'THE UNIT SQUARE';

    if (frame.lattice) label = frame.moving ? 'POINTS MOVING TO THE LATTICE' : 'LATTICE · N = 30';
    if (frame.random) label = frame.moving ? 'POINTS MOVING · SAME 961' : 'RANDOM · SAME 961';
    if (time >= 14500 && time < 50750 || time >= 60750) label = frame.moving ? 'POINT MORPH · SCHEMATIC' : 'FINITE CANTOR SAMPLE';

    note(pen, label, box.x + box.w / 2, box.y - (tall ? 16 : 20), box.w + 12, size - 1, colors.ink);
  }

  private pairs(square: Box, bar: Box, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const clock = pairClock(time);
    const completed = Math.min(66, Math.floor(clock));
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
    line(pen, bar.x, bar.y + 8, bar.x + bar.w, bar.y + 8);

    for (let index = 0; index < completed; index++) {
      const pair = this.model.opening.pairs[index];

      if (!pair) throw new Error('The opening has sixty-six unordered pairs.');

      const x = bar.x + pair.distance / Math.SQRT2 * bar.w;
      line(pen, x, bar.y - 3, x, bar.y + 5);
    }

    const pair = this.model.opening.pairs[completed];

    if (pair && time >= 850) {
      const a = this.model.opening.points[pair.i];
      const b = this.model.opening.points[pair.j];

      if (!a || !b) throw new Error('A carried distance keeps both endpoint identities.');

      const fold = smooth(clock % 1, .2, 1);
      const x = bar.x + pair.distance / Math.SQRT2 * bar.w;
      line(pen, mix(square.x + 2 + a.x * (square.w - 4), x, fold), mix(square.y + square.h - 2 - a.y * (square.h - 4), bar.y - 3, fold), mix(square.x + 2 + b.x * (square.w - 4), x, fold), mix(square.y + square.h - 2 - b.y * (square.h - 4), bar.y + 5, fold));
    }

    this.barAxis(bar, false, tall);
  }

  private barAxis(box: Box, squared: boolean, tall: boolean): void {
    const { pen, colors } = this;
    const size = tall ? 9 : 13;
    const baseline = box.y + 8;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .65;
    line(pen, box.x, baseline, box.x + box.w, baseline);
    line(pen, box.x, baseline - 3, box.x, baseline + 4);
    line(pen, box.x + box.w, baseline - 3, box.x + box.w, baseline + 4);
    note(pen, '0', box.x, baseline + 15, 20, size, colors.ink);

    if (squared) note(pen, '2', box.x + box.w, baseline + 15, 20, size, colors.ink);
    else this.labels.place('r-end', box.x + box.w, baseline + 17);

    this.labels.place(squared ? 'sq-distance' : 'distance', box.x + box.w / 2, baseline + 17);
  }

  private ticks(box: Box, positions: number[], dense: boolean): void {
    const { pen, colors } = this;
    pen.fillStyle = colors.ink;
    pen.beginPath();

    for (const [index, position] of positions.entries()) {
      const x = box.x + position * box.w;
      const y = dense ? box.y + (index % 8 - 3.5) / this.density : box.y - 3;
      pen.rect(x, y, dense ? .65 / this.density : Math.min(1.1, box.w / 135 * .7), dense ? 1 / this.density : 8);
    }

    pen.fill();
  }

  private distanceBar(box: Box, frame: BarFrame, time: number, tall: boolean): void {
    const { pen, colors } = this;
    const small = tall ? 9 : 13;
    this.ticks(box, frame.positions, frame.squared);

    if (frame.continuum > 0) {
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 3;
      line(pen, box.x, box.y, box.x + box.w * .3 * frame.continuum, box.y);
      pen.lineWidth = .8;
    }

    this.barAxis(box, frame.squared, tall);

    if (time >= 50750 && time < 60750) {
      const second = { ...box, y: box.y + 64 };
      const split = smooth(time, 55500, 57300);
      const collapse = smooth(time, 59500, 60750);
      const travel = { ...second, y: mix(mix(box.y, second.y, split), box.y, collapse) };

      if (time >= 55500) this.ticks(travel, carried(this.latticePositions, this.randomPositions, split), true);

      if (!frame.moving) note(pen, `${this.model.lattice.hitBins.length} / ${this.model.lattice.totalBins} · LATTICE 22.6%`, box.x + box.w / 2, box.y - 18, box.w, small, colors.ink);

      if (split >= 1 && collapse === 0) {
        note(pen, `${this.model.random.hitBins.length} / ${this.model.random.totalBins} · RANDOM 86.1%`, box.x + box.w / 2, second.y - 16, box.w, small, colors.ink);
        pen.strokeStyle = colors.muted;
        line(pen, second.x, second.y + 8, second.x + second.w, second.y + 8);
      } else if (time >= 55500) note(pen, 'BAR IN TRANSIT · SCHEMATIC', box.x + box.w / 2, second.y + 20, box.w, small - 1, colors.ink);
    }
  }

  private thresholds(square: Box, entrance: number, time: number, tall: boolean): void {
    const { pen, colors, width: w, height: h } = this;
    const x = tall ? w * .71 : w * .65;
    const y = square.y;
    const axisH = square.h;
    const small = tall ? 9 : 13;
    const axisY = (value: number): number => y + axisH * (1 - value / 2);
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .9;
    line(pen, x, y, x, y + axisH * entrance);

    for (const value of [0, 1, 2]) {
      const py = axisY(value);
      line(pen, x - 3, py, x + 3, py);
      const labelX = tall && value === 0 ? x + 10 : x - (tall ? 10 : 15);
      note(pen, String(value), labelX, py + (value === 0 && !tall ? 8 : 0), 24, small, colors.ink);
    }

    this.labels.place('dimension', x, y - 18);
    const shortTags = w < 880;
    const rows = [
      { value: 1.5, start: 22250, label: shortTags ? '3/2 · 1985' : '3/2 · FALCONER 1985', row: .25 },
      { value: 4 / 3, start: 38250, label: shortTags ? '4/3 · 1999' : '4/3 · WOLFF 1999', row: .48 },
      { value: 1.25, start: 41500, label: shortTags ? '5/4 · 2020' : '5/4 · GUTH–IOSEVICH–OU–WANG 2020', row: .73 },
    ];
    const tagX = tall ? w * .87 : w * .82;
    const tagW = tall ? w * .24 : w * .30;

    for (const row of rows) {
      const amount = smooth(time, row.start, row.start + 1100);

      if (amount <= 0) continue;

      const py = mix(y, axisY(row.value), amount);
      const tagY = y + axisH * row.row;
      line(pen, x - 4, py, x + 4, py);
      pen.strokeStyle = colors.muted;
      pen.beginPath();
      pen.moveTo(x + 4, py);
      pen.lineTo(x + (tall ? 8 : 15), py);
      pen.lineTo(tagX - tagW / 2, tagY);
      pen.stroke();
      pen.strokeStyle = colors.ink;
      note(pen, row.label, tagX, tagY, tagW, small - (tall ? 1 : 0), colors.ink, 'Alegreya');
    }

    if (time >= 44800) {
      const py = axisY(1);
      pen.beginPath();
      pen.arc(x, py, tall ? 3.5 : 5, 0, 2 * Math.PI);
      pen.fillStyle = colors.paper;
      pen.fill();
      pen.stroke();
      if (!tall) note(pen, 'TARGET 1', x - 85, axisY(1), w * .22, small, colors.ink);
    }

    if (time >= 60750) {
      const amount = smooth(time, 60750, 62500);
      const left = x - (tall ? 26 : 38);
      pen.strokeStyle = colors.blue;
      pen.lineWidth = tall ? 1.6 : 2.4;
      line(pen, left, axisY(1) - 5, left, mix(axisY(1) - 5, y, amount));
      line(pen, left, y, left + 6, y);
      pen.beginPath();
      pen.arc(left, axisY(1), tall ? 3 : 4, 0, 2 * Math.PI);
      pen.stroke();
      pen.lineWidth = .8;
    }

    if (!tall && time >= 38250 && time < 60750) note(pen, 'PLANE · FORTY YEARS OF THRESHOLDS', w * .84, h * .71, w * .27, small - 1, colors.ink);
  }

  private claim(box: Box, time: number, tall: boolean, moving: boolean): void {
    const { pen, colors, width: w, height: h } = this;
    const compact = !tall && w < 880;
    const narrowAspect = !tall && w < 760;
    const size = tall ? 9 : compact ? 11 : 13;
    const amount = smooth(time, 60750, 62500);
    const y = box.y - 16;
    pen.strokeStyle = colors.blue;
    pen.lineWidth = tall ? 1.7 : 2.4;
    line(pen, box.x, y + 5, box.x, y);
    line(pen, box.x, y, box.x + box.w * amount, y);
    line(pen, box.x + box.w, y, box.x + box.w, y + 5);
    const x = tall ? w / 2 : w * .82;
    const claimY = tall ? h * .455 : h * (narrowAspect ? .59 : .625);
    note(pen, 'CLAIMED', x, claimY, tall ? w - 24 : w * .43, size + 2, colors.blue);

    const finiteY = tall ? h * .76 : h - (compact ? 52 : 69);

    if (moving) note(pen, 'POINTS AND BAR IN TRANSIT · SCHEMATIC', w / 2, finiteY, w - 25, size - 1, colors.ink);
    else note(pen, 'FINITE SAMPLE · BIN COVERAGE IS NOT LENGTH', w / 2, finiteY, w - 25, size - 1, colors.ink);

    this.labels.place('hausdorff', x - (tall ? 35 : 45), claimY + (tall ? 20 : 30));
    note(pen, '>', x + (tall ? 2 : 4), claimY + (tall ? 20 : 30), 15, size + 4, colors.ink, '"Garamond Math"');
    this.labels.place('half-dimension', x + (tall ? 34 : 46), claimY + (tall ? 20 : 30));
    const status = time >= 68750 ? 'UNREVIEWED' : 'EVERY COMPACT SET · EVERY INTEGER d ≥ 2';
    note(pen, status, w / 2, tall ? h * .84 : h - (compact ? 37 : 49), w - 24, time >= 68750 ? size + 2 : size, colors.ink, time >= 68750 ? '"Special Elite"' : '"Garamond Math"');

    if (time < 68750) {
      this.labels.place('positive-length', tall ? w / 2 : x, h * (tall ? .90 : narrowAspect ? .72 : .74));
      note(pen, 'POSITIVE LENGTH · NO INTERVAL ASSERTED', w / 2, tall ? h * .98 : h - 10, w - 24, size - 1, colors.ink);
    } else if (time >= 75500) {
      note(pen, 'LEAN STATEMENTS ONLY', w / 2, tall ? h * .90 : h - (compact ? 22 : 29), w - 24, size, colors.ink);
      note(pen, 'PLANAR CATALOGUED · ALL-DIMENSIONS NOT', w / 2, tall ? h * .98 : h - (compact ? 7 : 9), w - 24, size - 1, colors.ink);
    } else note(pen, 'NO PUBLIC HUMAN CHECK · 18 OCTOBER 2026', w / 2, tall ? h * .94 : h - (compact ? 10 : 20), w - 24, size - 1, colors.ink);
  }
}
