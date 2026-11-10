import { mix, progress, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { type Box, type Colors, line, text } from './drawing';
import { pairs, triples, type Edge, type PartyModel, type Triple } from './math';
import { drawBitBars, drawClosingLedger, drawPanels } from './panels';
import { layout } from './story';

type Point = { x: number; y: number };

function ringPoint(box: Box, index: number, count: number, radius: number): Point {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / count;

  return { x: box.x + box.w / 2 + radius * Math.cos(angle), y: box.y + box.h * .43 + radius * Math.sin(angle) };
}

function blend(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function dot(pen: CanvasRenderingContext2D, point: Point, radius: number, filled = true): void {
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);

  if (filled) pen.fill();

  pen.stroke();
}

export class PartyGapFilm {
  private width = 1;
  private height = 1;
  private density = 1;
  private readonly labels: FilmLabels;
  private readonly colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  private readonly independent: Set<number>;
  private readonly hunt: Triple[] = triples(6);

  constructor(private readonly root: HTMLElement, private readonly canvas: HTMLCanvasElement, private readonly pen: CanvasRenderingContext2D, private readonly model: PartyModel) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
    this.independent = new Set(model.toy.independent);
  }

  resize(width: number, height: number, density: number): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.canvas.width = Math.round(width * density);
    this.canvas.height = Math.round(height * density);
    const style = getComputedStyle(this.root);

    for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) this.colors[tone] = style.getPropertyValue(`--${tone}`).trim() || this.colors[tone];

    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { pen, colors, model } = this;
    const boxes = layout(this.width, this.height, time);
    this.labels.beginFrame();
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, this.width, this.height);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);

    if (time < 63250) this.party(boxes.stage, time, boxes.tall);
    else if (time < 107750) {
      const bitRoom = boxes.tall ? 0 : smooth(time, 87250, 88500);
      this.flags({ ...boxes.stage, h: boxes.stage.h * mix(1, .54, bitRoom) }, time, boxes.tall);

      if (!boxes.tall && time >= 88500) drawBitBars(pen, { x: boxes.stage.x, y: boxes.stage.y + boxes.stage.h * .58, w: boxes.stage.w, h: boxes.stage.h * .37 }, time, colors, this.labels.place, false);
    }
    else {
      this.closingParty(boxes.stage, time, boxes.tall);

      if (!boxes.tall && time >= 108850) drawClosingLedger(pen, { x: boxes.stage.x, y: boxes.stage.y + boxes.stage.h * .80, w: boxes.stage.w, h: boxes.stage.h * .18 }, colors, false);
    }

    drawPanels(pen, boxes.panel, time, colors, this.labels.place, model, boxes.tall);
    this.labels.endFrame();
  }

  private edge(a: Point, b: Point, acquainted: boolean, amount = 1, heavy = false): void {
    const { pen, colors } = this;
    pen.strokeStyle = heavy ? colors.paper : colors.ink;
    pen.lineWidth = heavy ? 4 : .85;
    pen.setLineDash(acquainted ? [] : [4, 3]);
    line(pen, a.x, a.y, b.x, b.y, amount);

    if (heavy) {
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1.9;
      line(pen, a.x, a.y, b.x, b.y, amount);
    }

    pen.setLineDash([]);
  }

  private person(point: Point, index: number, tall: boolean, radius = 3): void {
    const { pen, colors } = this;
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.paper;
    pen.lineWidth = 1;
    dot(pen, { x: point.x, y: point.y - 3 }, radius);
    line(pen, point.x, point.y + radius - 3, point.x, point.y + 7);
    line(pen, point.x - 4, point.y + 4, point.x + 4, point.y + 4);
    text(pen, String(index + 1), point.x, point.y + 17, tall ? 11 : 15, 20, colors);
  }

  private drawParty(points: Point[], edges: readonly Edge[], colors: readonly boolean[], time: number, tall: boolean, count = 6, hunt = false): void {
    for (const [index, [a, b]] of edges.entries()) {
      const first = points[a];
      const second = points[b];
      const acquainted = colors[index];

      if (!first || !second || acquainted === undefined) throw new Error('Each drawn party edge has two people and a pair style.');

      const amount = hunt ? smooth(time, index * 90, index * 90 + 420) : 1;
      this.edge(first, second, acquainted, amount);
    }

    if (count === 6 && (!hunt || time >= 4400)) {
      for (const triangle of this.model.party.triangles) this.triangle(points, triangle.vertices, true);
    } else if (hunt && time >= 1500 && time < 4400) {
      const index = Math.min(this.hunt.length - 1, Math.floor(progress(time, 1500, 4400) * this.hunt.length));
      const vertices = this.hunt[index];

      if (vertices) {
        this.pen.strokeStyle = this.colors.ink;
        this.pen.lineWidth = 1.1;

        for (const vertex of vertices) {
          const point = points[vertex];

          if (!point) throw new Error('Each inspected triangle has three drawn people.');

          dot(this.pen, point, tall ? 8 : 11, false);
        }
      }
    }

    for (const [index, point] of points.entries()) this.person(point, index, tall, tall ? 3 : 4);
  }

  private triangle(points: Point[], vertices: Triple, heavy: boolean): void {
    const [a, b, c] = vertices;

    for (const [first, second] of [[a, b], [b, c], [a, c]]) {
      if (first === undefined || second === undefined) throw new Error('A triangle edge has two endpoints.');

      const start = points[first];
      const end = points[second];

      if (!start || !end) throw new Error('Each triangle vertex is a drawn person.');

      this.edge(start, end, true, 1, heavy);
    }
  }

  private party(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const radius = Math.min(box.w * .31, box.h * .31);
    const left = smooth(time, 5000, 6200) * (1 - smooth(time, 10000, 11200));
    const grown = smooth(time, 18000, 19900);
    const small = smooth(time, 30500, 31600);
    const centre = { x: mix(box.x + box.w / 2, box.x + box.w * .24, small), y: mix(box.y + box.h * .43, box.y + box.h * .31, small) };
    const r = radius * mix(1, .48, small);

    if (grown === 0) {
      const points = Array.from({ length: 6 }, (_, index) => {
        const start = ringPoint(box, index, 6, radius);
        const end = index === 5 ? { x: box.x + box.w - 14, y: box.y + 26 } : ringPoint(box, index, 5, radius);

        return blend(start, end, left);
      });
      const five = time >= 6200 && time < 11200;
      this.drawParty(points, five ? pairs(5) : model.party.pairs, five ? model.party.pentagon : model.party.colors, time, tall, five ? 5 : 6, time < 5000);
      let title = 'SIX PEOPLE · SOLID KNOW, DASHED DO NOT';

      if (five && left === 1) title = 'FIVE PEOPLE · NO ONE-COLOUR TRIANGLE';
      else if (left > 0) title = time < 10000 ? 'ONE PERSON STEPS OUT' : 'THE SIXTH PERSON RETURNS';

      text(pen, title, box.x + box.w / 2, box.y + 9, tall ? 9 : 13, box.w - 5, colors);

      if (left === 1) {
        const sixth = points[5];

        if (!sixth) throw new Error('The sixth person remains visible outside the five-person party.');

        text(pen, 'OUT', sixth.x, box.y + 51, tall ? 7 : 10, 30, colors);
      }

      if (time >= 4400 && time < 5000) text(pen, 'TWO TRIOS · ALL ACQUAINTED', box.x + box.w / 2, box.y + box.h - 4, tall ? 9 : 13, box.w - 5, colors);

      return;
    }

    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = .7;

    for (let index = 0; index < 43; index++) {
      const angle = -Math.PI / 2 + index * 2 * Math.PI / 43;
      const target = { x: centre.x + r * Math.cos(angle), y: centre.y + r * Math.sin(angle) };
      const start = ringPoint(box, index % 6, 6, radius);
      const point = blend(start, target, grown);
      dot(pen, point, tall ? mix(1.8, .7, small) : mix(2.8, 1.3, small));
    }

    const title = small > 0 ? 'THE PARTY BECOMES A GROWTH QUESTION' : grown < 1 ? 'THE PARTY GROWS · TRANSITION' : '43 POSITIONS · PAIR STYLES NOT ASSIGNED';
    text(pen, title, box.x + box.w / 2, box.y + 9, tall ? 8.5 : 13, box.w - 5, colors);

    if (time < 30500 && grown === 1) this.generalGroups(box, tall);
  }

  private generalGroups(box: Box, tall: boolean): void {
    const { pen, colors } = this;
    const y = box.y + box.h * .84;
    const radius = Math.min(box.w * .12, box.h * .09);

    for (const group of [0, 1]) {
      const cx = box.x + box.w * (group === 0 ? .25 : .75);
      const dots = Array.from({ length: 5 }, (_, index) => ({ x: cx + radius * Math.cos(-Math.PI / 2 + index * Math.PI * 2 / 5), y: y + radius * Math.sin(-Math.PI / 2 + index * Math.PI * 2 / 5) }));

      if (group === 0) {
        for (const [a, b] of pairs(5)) {
          const first = dots[a];
          const second = dots[b];

          if (!first || !second) throw new Error('The schematic clique has five drawn people.');

          this.edge(first, second, true);
        }
      }

      pen.fillStyle = colors.ink;
      pen.strokeStyle = colors.ink;

      for (const point of dots) dot(pen, point, tall ? 1.8 : 2.5);

      text(pen, group === 0 ? 's · ALL JOINED' : 't · NONE JOINED', cx, y + radius + 13, tall ? 8 : 12, box.w * .46, colors);
    }
  }

  private flagPositions(box: Box, time: number): Point[] {
    const amount = smooth(time, 63250, 64350);
    const radius = Math.min(box.w * .31, box.h * .31) * .48;
    const lift = smooth(time, 87250, 88500);
    const independent = this.model.toy.independent;

    return this.model.toy.flags.map((_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / 43;
      const start = { x: box.x + box.w * .24 + radius * Math.cos(angle), y: box.y + box.h * .31 + radius * Math.sin(angle) };
      const end = { x: box.x + box.w * (.045 + .91 * index / 19), y: box.y + box.h * .46 };
      const position = blend(start, end, amount);
      const selection = independent.indexOf(index);

      if (selection >= 0) return blend(position, { x: box.x + box.w * (.06 + .88 * selection / 9), y: box.y + box.h * .65 }, lift);

      return position;
    });
  }

  private flags(box: Box, time: number, tall: boolean): void {
    const { pen, colors, model } = this;
    const points = this.flagPositions(box, time);
    const amount = smooth(time, 63250, 64350);
    pen.strokeStyle = colors.ink;
    pen.fillStyle = colors.ink;
    pen.lineWidth = .6;

    if (amount < 1) {
      const radius = Math.min(box.w * .31, box.h * .31) * .48;

      for (let index = 20; index < 43; index++) {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / 43;
        const start = { x: box.x + box.w * .24 + radius * Math.cos(angle), y: box.y + box.h * .31 + radius * Math.sin(angle) };
        const point = blend(start, { x: box.x - 10, y: box.y - 15 }, amount);
        dot(pen, point, tall ? 1.8 : 2.8);
      }
    }

    for (const [index, [a, b]] of model.toy.graph.edges.entries()) {
      const first = points[a];
      const second = points[b];

      if (!first || !second) throw new Error('Every toy edge has two stream positions.');

      const draw = index < 3 ? smooth(time, 64350 + index * 600, 64750 + index * 600) : smooth(time, 66200, 67100);
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 - Math.min(box.h * .38, Math.abs(second.x - first.x) * .45) };
      pen.beginPath();
      pen.moveTo(first.x, first.y);

      for (let step = 1; step <= Math.ceil(30 * draw); step++) {
        const t = Math.min(draw, step / 30);
        const u = 1 - t;
        pen.lineTo(u * u * first.x + 2 * u * t * midpoint.x + t * t * second.x, u * u * first.y + 2 * u * t * midpoint.y + t * t * second.y);
      }

      pen.stroke();
    }

    for (const [index, point] of points.entries()) {
      const flag = model.toy.flags[index];

      if (!flag) throw new Error('Every stream position has a flag.');

      const rotation = flag.line * Math.PI / 13;
      const arm = tall ? 4 : 7;
      line(pen, point.x - Math.cos(rotation) * arm, point.y - Math.sin(rotation) * arm, point.x + Math.cos(rotation) * arm, point.y + Math.sin(rotation) * arm);
      dot(pen, point, tall ? 1.4 : 2.1);

      if (!tall) text(pen, `${index + 1}\n${flag.point},${flag.line}`, point.x, point.y + 14, 9, box.w / 21, colors);
      if (time >= 75250 && this.independent.has(index)) dot(pen, point, tall ? 3.4 : 5, false);
    }

    if (time >= 72250 && time < 75250) {
      const x = box.x + box.w * (.045 + .91 * progress(time, 72250, 75250));
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 1;
      line(pen, x, box.y + 20, x, box.y + box.h * .46 - 6);
      line(pen, x - 3, box.y + box.h * .46 - 10, x, box.y + box.h * .46 - 6);
      line(pen, x + 3, box.y + box.h * .46 - 10, x, box.y + box.h * .46 - 6);
    }

    let title = 'TOY · FIELD OF THREE ELEMENTS';

    if (time < 64350) title = 'THE PARTY LINES UP · TRANSITION';
    else if (time >= 87250) title = 'THE TEN STRANGERS LIFT OUT · TOY';
    else if (time >= 75250) title = '10 STRANGERS · THE LARGEST HERE';
    else if (time >= 72250) title = 'CHECKING TRIANGLES · d = 2';

    text(pen, title, box.x + box.w / 2, box.y + 9, tall ? 9 : 14, box.w - 4, colors);
    const tags = time >= 75250 ? `NO TRIANGLE · ${model.toy.streamsChecked.toLocaleString('en-US')} RANDOM STREAMS OF 30\n10 RINGS · NO TWO JOINED\nTOY: d = 2 · PAPERS: d = s − 1, HUGE q` : `13 POINTS · 13 LINES · 52 FLAGS\n${time < 67100 ? 'ADDING ' : ''}31 EDGES · TOY: d = 2 · HUGE q IN PAPERS`;
    text(pen, tags, box.x + box.w / 2, box.y + box.h - (time >= 75250 ? tall ? 29 : 42 : tall ? 16 : 27), tall ? 8 : 11, box.w - 4, colors);
  }

  private closingParty(box: Box, time: number, tall: boolean): void {
    const amount = smooth(time, 107750, 108850);
    const from = this.flagPositions({ ...box, h: tall ? box.h : box.h * .54 }, 107750);
    const ringBox = { x: box.x, y: box.y + 12, w: box.w, h: box.h - 12 };
    const radius = Math.min(ringBox.w * .31, ringBox.h * .31);
    const points: Point[] = [];

    for (let index = 0; index < 20; index++) {
      const start = from[index];

      if (!start) throw new Error('Each closing stream position exists.');

      const end = index < 6 ? ringPoint(ringBox, index, 6, radius) : { x: box.x + box.w + 14, y: box.y + box.h * .4 };
      const point = blend(start, end, amount);

      if (index < 6) points.push(point);
      else if (amount < 1) {
        this.pen.fillStyle = this.colors.ink;
        this.pen.strokeStyle = this.colors.ink;
        dot(this.pen, point, tall ? 1.4 : 2.1);
      }
    }

    this.drawParty(points, this.model.party.pairs, this.model.party.colors, time, tall);
    text(this.pen, amount < 1 ? 'BACK TO THE SIX-PERSON PARTY' : 'TWO ACQUAINTED TRIOS · EVERY SIX HAS A TRIO', box.x + box.w / 2, box.y + 9, tall ? 8.5 : 13, box.w - 4, this.colors);
  }
}
