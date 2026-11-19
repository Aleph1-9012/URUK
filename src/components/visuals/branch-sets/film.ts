import { mix } from '../../../lib/animation';
import type { FilmDrawing } from '../../plate/controller';
import { PAGE_TONES, PHONE_STAGE_WIDTH, type FilmFrame } from '../../plate/frame';
import { FilmLabels } from '../../plate/labels';
import { drawLine, drawText, drawWrappedText } from '../../plate/canvas/wrapped-text';
import { buildBranchSetsModel, isEdge, type GraphAnalysis, type Point } from './math';
import { drawBranchPanels } from './panels';
import { motionAt, SCENE_TIMES } from './story';

type Motion = ReturnType<typeof motionAt>;

type Field = { x: number; y: number; radius: number };

function between(a: Point, b: Point, amount: number): Point {
  return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
}

function ringPoint(field: Field, index: number, count: number): Point {
  const angle = -Math.PI / 2 + index * Math.PI * 2 / count;

  return { x: field.x + field.radius * Math.cos(angle), y: field.y + field.radius * Math.sin(angle) };
}

class BranchSetsFilm implements FilmDrawing {
  private width = 1;
  private height = 1;
  private density = 1;
  private tones = PAGE_TONES;
  private readonly model = buildBranchSetsModel();
  private readonly labels: FilmLabels;

  constructor(root: HTMLElement, private readonly pen: CanvasRenderingContext2D) {
    this.labels = new FilmLabels(root, { horizontal: 5, vertical: 5 });
  }

  resize({ width, height, density, tones }: FilmFrame): void {
    this.width = width;
    this.height = height;
    this.density = density;
    this.tones = tones;
    this.labels.resize(width, height);
  }

  draw(time: number): void {
    const { pen, width: w, height: h } = this;
    const motion = motionAt(time);
    pen.setTransform(this.density, 0, 0, this.density, 0, 0);
    pen.clearRect(0, 0, w, h);
    pen.lineCap = 'round';
    pen.lineJoin = 'round';
    pen.setLineDash([]);
    this.labels.beginFrame();
    this.graph(time, motion);

    if (time < SCENE_TIMES.independence) this.openingNotes(motion);
    else if (time < SCENE_TIMES.examples) this.independence(motion);
    else if (time < SCENE_TIMES.schematic) this.exampleNotes(motion);

    if (time >= SCENE_TIMES.schematic) this.cloud(time, motion);
    if (motion.definitionExpansion > 0 && motion.definitionRetirement < 1) this.matching(motion);

    drawBranchPanels(pen, w, h, time, this.tones, this.labels);
    this.labels.endFrame();
  }

  private text(value: string, x: number, y: number, size: number, math = false): void {
    drawText(this.pen, value, x, y, { size, color: this.tones.ink, family: math ? 'math' : 'type' });
  }

  private note(value: string, x: number, y: number, width: number, size: number): void {
    drawWrappedText(this.pen, value, x, y, width, { size, color: this.tones.ink });
  }

  private arrowHead(tip: Point, angle: number, amount = 1): void {
    for (const offset of [-.5, .5]) {
      drawLine(this.pen, tip.x, tip.y, tip.x - 6 * amount * Math.cos(angle + offset), tip.y - 6 * amount * Math.sin(angle + offset), this.tones.ink, .9);
    }
  }

  private glyph(point: Point, kind: number, radius: number): void {
    if (!Number.isInteger(kind) || kind < -1 || kind > 3) throw new RangeError('The finite graph stage has four distinct ink classes and an uncoloured state.');

    const { pen, tones } = this;
    pen.beginPath();
    pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
    pen.fillStyle = tones.paper;
    pen.strokeStyle = tones.ink;
    pen.lineWidth = 1;
    pen.fill();
    pen.stroke();
    pen.save();
    pen.clip();

    if (kind === 0) {
      pen.beginPath();
      pen.arc(point.x, point.y, radius * .40, 0, Math.PI * 2);
      pen.fillStyle = tones.ink;
      pen.fill();
    } else if (kind === 1) {
      drawLine(pen, point.x - radius, point.y + radius, point.x + radius, point.y - radius, tones.ink, 1.2);
      drawLine(pen, point.x - radius, point.y + radius * .15, point.x + radius * .15, point.y - radius, tones.ink, .7);
    } else if (kind === 2) {
      drawLine(pen, point.x - radius, point.y - radius, point.x + radius, point.y + radius, tones.ink, 1.2);
      drawLine(pen, point.x - radius, point.y - radius * .15, point.x + radius * .15, point.y + radius, tones.ink, .7);
    } else if (kind === 3) {
      drawLine(pen, point.x - radius, point.y, point.x + radius, point.y, tones.ink, 1);
      drawLine(pen, point.x, point.y - radius, point.x, point.y + radius, tones.ink, 1);
    }

    pen.restore();
  }

  private field(motion: Motion): Field {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const regular = { x: w * (phone ? .5 : .28), y: h * (phone ? .255 : .38), radius: Math.min(w * (phone ? .33 : .21), h * (phone ? .14 : .25)) };
    const small = { x: w * (phone ? .85 : .19), y: h * (phone ? .09 : .13), radius: h * (phone ? .035 : .065) };
    const retirement = motion.cloud * (1 - motion.definitionCloudShift);

    return {
      x: mix(regular.x, small.x, retirement),
      y: mix(regular.y, small.y, retirement),
      radius: mix(regular.radius, small.radius, retirement),
    };
  }

  private analysis(count: number): GraphAnalysis {
    const result = this.model.small.find(item => item.graph.n === count);

    if (!result) throw new Error('Every example needs its computed graph model.');

    return result;
  }

  private currentPoints(time: number, motion: Motion): Point[] {
    const field = this.field(motion);

    if (time < SCENE_TIMES.examples) {
      const triangle = { x: field.x, y: field.y, radius: field.radius * .82 };

      return Array.from({ length: 5 }, (_, vertex) => {
        const a = ringPoint({ ...field, radius: field.radius * motion.ring }, vertex, 5);
        const group = this.model.contraction.branches.findIndex(branch => branch.includes(vertex));

        if (group < 0) throw new Error('Every carried cycle vertex needs its actual contraction branch.');

        return between(a, ringPoint(triangle, group, 3), motion.contraction);
      });
    }

    const example = motion.example;

    return Array.from({ length: example.to }, (_, vertex) => {
      const before = ringPoint(field, Math.min(vertex, example.from - 1), example.from);
      const after = ringPoint(field, vertex, example.to);

      if (example.to === 5) {
        const oldPosition = ringPoint(field, 3 * vertex % 5, 5);

        return between(oldPosition, after, motion.relabelling);
      }

      return between(before, after, example.amount);
    });
  }

  private graph(time: number, motion: Motion): void {
    const { width: w, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const firstCycle = time < SCENE_TIMES.examples;
    const current = firstCycle ? this.model.fiveCycle : this.analysis(motion.example.to);
    const previous = firstCycle ? current : this.analysis(motion.example.from);
    const points = this.currentPoints(time, motion);
    const definition = motion.definitionCloudShift;
    const retireEdges = 1 - motion.cloud * (1 - definition);

    for (const [index, edge] of current.graph.edges.entries()) {
      const a = points[edge[0]];
      const b = points[edge[1]];

      if (!a || !b) throw new Error('Each drawn exact edge needs both computed endpoints.');

      const born = firstCycle ? Math.max(0, Math.min(1, motion.edges * current.graph.edges.length - index)) : edge[1] < previous.graph.n && isEdge(previous.graph, edge[0], edge[1]) ? 1 : motion.example.amount;
      const amount = born * retireEdges;

      if (amount <= 0) continue;

      const center = between(a, b, .5);
      const left = between(center, a, amount);
      const right = between(center, b, amount);
      const clash = firstCycle && motion.replayTwoColours && motion.twoColourWalk === 1 && motion.colourResolution < .5 && edge[0] === 0 && edge[1] === 4;
      drawLine(pen, left.x, left.y, right.x, right.y, tones.ink, clash ? 3 : firstCycle ? 1.2 : .65);
    }

    for (const [vertex, point] of points.entries()) {
      if (firstCycle && motion.contraction === 1 && vertex > 0 && vertex < 3) continue;

      let colour = current.colours[vertex];

      if (colour === undefined) throw new Error('Each exact vertex needs its live proper-colouring class.');

      if (!firstCycle && motion.example.to === 5 && motion.relabelling < 1) {
        const carriedColour = this.model.fiveCycle.colours[3 * vertex % 5];

        if (carriedColour === undefined) throw new Error('The isomorphism carry needs the old vertex colouring.');

        colour = carriedColour;
      }

      if (firstCycle && (motion.thirdColour < .5 || motion.replayTwoColours && motion.colourResolution < .5)) {
        const alternating = this.model.alternating[vertex];

        if (alternating === undefined) throw new Error('Every trial-pattern vertex needs its alternating class.');

        colour = alternating;
      }
      if (firstCycle && motion.replayTwoColours && vertex > Math.floor(motion.twoColourWalk * 5) && motion.colourResolution < .5) colour = -1;
      if (motion.contraction > 0 || motion.cloud > 0 && definition < 1) colour = -1;

      const newVertex = !firstCycle && vertex >= motion.example.from;
      const radius = (phone ? 4 : 5) * (newVertex ? motion.example.amount : 1);

      if (radius > .05) this.glyph(point, colour, radius);

      if (motion.scene === 'contraction' && motion.contraction === 1) {
        this.text(vertex === 0 ? '{0,1,2}' : String(vertex), point.x, point.y - (phone ? 10 : 17), phone ? 10 : 12, true);
      }
    }
  }

  private openingNotes(motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const contraction = motion.scene === 'contraction';
    this.text(contraction ? 'MERGE CONNECTED BRANCH SETS' : motion.scene === 'oddCycle' ? 'TWO PATTERNS CANNOT CLOSE THE ODD RING' : 'LINKED POINTS NEED DIFFERENT PATTERNS', w * .5, h * .045, phone ? 9 : 14);

    if (contraction) {
      this.labels.place('h-three', w * (phone ? .5 : .76), h * (phone ? .55 : .35));
      this.note('BRANCHES: {0,1,2}, {3}, {4}\nCONTRACT EDGES 0–1 AND 1–2', w * (phone ? .5 : .76), h * (phone ? .65 : .53), w * (phone ? .9 : .40), phone ? 10 : 13);
      this.text('GROUPS, NOT COLOUR CLASSES', w * .5, h * (phone ? .82 : .86), phone ? 9 : 12);

      return;
    }

    const proper = motion.thirdColour >= .5 && (!motion.replayTwoColours || motion.colourResolution >= .5);
    this.text(proper ? 'CHROMATIC NUMBER 3' : 'TRY TWO INK PATTERNS', w * (phone ? .5 : .28), h * (phone ? .44 : .74), phone ? 11 : 16);

    if (motion.scene === 'oddCycle') {
      this.text(`${this.model.colouringAttempts.length} OF ${this.model.colouringAttempts.length} TWO-PATTERN TRIALS CLASH`, w * (phone ? .5 : .76), h * (phone ? .57 : .35), phone ? 10 : 13);
      this.note('THE FIFTH EDGE JOINS EQUAL PATTERNS\nA THIRD PATTERN RESOLVES THE CLASH', w * (phone ? .5 : .76), h * (phone ? .65 : .49), w * (phone ? .9 : .40), phone ? 9 : 12);

      return;
    }

    if (motion.scene !== 'conjecture') return;

    const triangle = { x: w * (phone ? .5 : .76), y: h * (phone ? .66 : .37), radius: h * (phone ? .10 : .16) * motion.minorHint };
    const points = Array.from({ length: 3 }, (_, vertex) => ringPoint(triangle, vertex, 3));

    for (const [a, b] of this.model.triangle.edges) {
      const left = points[a];
      const right = points[b];

      if (!left || !right) throw new Error('The triangle minor hint needs its actual complete-graph endpoints.');

      drawLine(pen, left.x, left.y, right.x, right.y, tones.ink, 1);
    }

    for (const point of points) this.glyph(point, -1, (phone ? 3 : 4) * motion.minorHint);

    if (motion.minorHint > 0) {
      if (phone) {
        const steps = motion.minorHint * 3;
        const first = Math.min(1, steps);
        const second = Math.max(0, Math.min(1, steps - 1));
        const third = Math.max(0, Math.min(1, steps - 2));
        drawLine(pen, w * .84, h * .24, mix(w * .84, w * .91, first), h * .24, tones.ink, .8, [3, 3]);

        if (second > 0) drawLine(pen, w * .91, h * .24, w * .91, mix(h * .24, h * .66, second), tones.ink, .8, [3, 3]);

        if (third > 0) {
          const tip = { x: mix(w * .91, w * .71, third), y: h * .66 };
          drawLine(pen, w * .91, h * .66, tip.x, tip.y, tones.ink, .8, [3, 3]);
          this.arrowHead(tip, Math.PI, third);
        }
      } else {
        const start = { x: w * .51, y: h * .38 };
        const end = { x: mix(start.x, w * .63, motion.minorHint), y: h * .38 };
        drawLine(pen, start.x, start.y, end.x, end.y, tones.ink, .8, [3, 3]);
        this.arrowHead(end, 0, motion.minorHint);
      }
    }

    this.text('A TRIANGLE INSIDE AS A MINOR', triangle.x, h * (phone ? .81 : .63), phone ? 9 : 12);
    this.labels.place('conjecture', triangle.x, h * (phone ? .89 : .79));
  }

  private independence(motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const center = { x: w * (phone ? .5 : .76), y: h * (phone ? .65 : .43), radius: h * (phone ? .09 : .14) * motion.forbiddenTriple };
    const points = Array.from({ length: 3 }, (_, vertex) => ringPoint(center, vertex, 3));

    for (let a = 0; a < 3; a++) {
      for (let b = a + 1; b < 3; b++) {
        const first = points[a];
        const second = points[b];

        if (!first || !second) throw new Error('The forbidden triple needs its three illustrative points.');

        drawLine(pen, first.x, first.y, second.x, second.y, tones.ink, .8, [3, 3]);
      }
    }

    for (const point of points) this.glyph(point, -1, (phone ? 4 : 5) * motion.forbiddenTriple);

    const radius = center.radius * .9;
    drawLine(pen, center.x - radius, center.y - radius, center.x + radius, center.y + radius, tones.ink, 1.7);
    drawLine(pen, center.x - radius, center.y + radius, center.x + radius, center.y - radius, tones.ink, 1.7);
    this.text('NO THREE PAIRWISE STRANGERS', w * .5, h * .045, phone ? 10 : 15);
    this.labels.place('alpha', w * (phone ? .5 : .28), h * (phone ? .47 : .77));
    this.text('DASHES ARE MISSING EDGES', center.x, h * (phone ? .80 : .69), phone ? 9 : 12);
    this.text('FORBIDDEN · NOT A SUBGRAPH', center.x, h * (phone ? .85 : .76), phone ? 9 : 12);
  }

  private exampleNotes(motion: Motion): void {
    const { width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const changing = motion.example.amount < 1 || motion.relabelling < 1;
    this.text(motion.relabelling < 1 ? 'RELABEL THE SAME FIVE-CYCLE' : 'COMPLEMENTS OF CYCLES · EXACT EXAMPLES', w * .5, h * .045, phone ? 9 : 14);

    if (changing) {
      this.text(motion.relabelling < 1 ? 'NEW LABEL i ↦ 2i MOD 5 · EDGES STAY' : 'ONE MORE VERTEX · LINKS ARE GROWING', w * .5, h * (phone ? .50 : .79), phone ? 10 : 13, motion.relabelling < 1);

      return;
    }

    const current = this.analysis(motion.example.to);
    this.text(`m = ${current.graph.n}    χ = ${current.chi}    h = ${current.minor.h}`, w * (phone ? .5 : .76), h * (phone ? .50 : .30), phone ? 16 : 20, true);
    this.text(`α = ${current.alpha}    cm = ${current.matching.cm}`, w * (phone ? .5 : .76), h * (phone ? .56 : .40), phone ? 15 : 18, true);
    this.labels.place('half', w * (phone ? .5 : .76), h * (phone ? .64 : .53));
    this.text(`m/2 = ${(current.graph.n / 2).toFixed(1)}`, w * (phone ? .5 : .76), h * (phone ? .705 : .61), phone ? 12 : 16, true);
    this.note('EACH COLOUR CLASS HAS AT MOST TWO\nTHESE SMALL EXAMPLES OBEY HADWIGER', w * (phone ? .5 : .76), h * (phone ? .77 : .72), w * (phone ? .92 : .43), phone ? 9 : 12);
  }

  private cloud(time: number, motion: Motion): void {
    const { width: w, height: h, pen, tones } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const regular = { x: w * (phone ? mix(.5, .72, motion.claim) : .28), y: h * (phone ? mix(.27, .21, motion.claim) : .42) };
    const definition = { x: w * (phone ? .5 : .30), y: h * (phone ? .66 : .78) };
    const center = between(regular, definition, motion.definitionCloudShift);
    const rx = w * (phone ? mix(.34, .22, motion.claim) : .21) * mix(1, .65, motion.definitionCloudShift);
    const ry = h * (phone ? mix(.12, .075, motion.claim) : .21) * mix(1, .48, motion.definitionCloudShift);
    const sourceField = this.field({ ...motion, cloud: 0 });

    for (let index = 8; index < this.model.cloud.length; index++) {
      const point = this.model.cloud[index];

      if (!point) throw new Error('Each schematic stipple needs its deterministic coordinate.');

      const source = ringPoint(sourceField, index % 8, 8);
      const target = { x: center.x + point.x * rx, y: center.y + point.y * ry };
      const position = between(source, target, motion.cloud);
      this.glyph(position, 0, (phone ? 1 : 1.3) * motion.cloud);
    }

    if (motion.cloud < 1) {
      this.text('CARRIED INTO A SCHEMATIC', w * .5, h * .045, phone ? 10 : 15);

      return;
    }

    if (time < SCENE_TIMES.matching || time >= SCENE_TIMES.claim) {
      const returning = motion.definitionExpansion > 0 && motion.definitionRetirement < 1;

      if (motion.chart === 0 && !returning && motion.claim === 0) this.text('NO EXPLICIT COUNTEREXAMPLE GRAPH', w * (phone ? .43 : .28), h * (phone ? .055 : .045), phone ? 8.5 : 13);

      this.text('LAYOUT MARKS · ADJACENCIES NOT DRAWN', phone ? w / 2 : center.x, center.y + ry * 1.25 + (phone ? 8 : 12), phone ? 8.5 : 11);
      this.text('8-DOT EXAMPLE', w * (phone ? .85 : .19), h * (phone ? .025 : .23), phone ? 8 : 10);
    }

    if (motion.claim <= 0) return;

    const left = center.x - rx * 1.13;
    const right = center.x + rx * 1.13;
    const top = center.y - ry * 1.05;
    const bottom = center.y + ry * 1.05;
    const amount = motion.claim;

    for (const [x, direction] of [[left, 1], [right, -1]] as const) {
      drawLine(pen, x, top, x, mix(top, bottom, amount), tones.blue, 1.8);
      drawLine(pen, x, top, x + direction * 9 * amount, top, tones.blue, 1.8);
      drawLine(pen, x, bottom, x + direction * 9 * amount, bottom, tones.blue, 1.8);
    }
  }

  private matching(motion: Motion): void {
    const { pen, tones, width: w, height: h } = this;
    const phone = w < PHONE_STAGE_WIDTH;
    const current = this.analysis(8);
    const points = Array.from({ length: 8 }, (_, vertex) => ringPoint(this.field(motion), vertex, 8));

    for (const [index, [a, b]] of current.matching.edges.entries()) {
      const first = points[a];
      const second = points[b];

      if (!first || !second) throw new Error('Each matching edge needs its two actual graph vertices.');

      const amount = Math.max(0, Math.min(1, motion.matching * current.matching.edges.length - index)) * (1 - motion.definitionRetirement);
      const end = between(first, second, amount);
      drawLine(pen, first.x, first.y, end.x, end.y, tones.ink, 3);
    }

    for (const [index, connection] of current.matching.connections.entries()) {
      const first = points[connection.edge[0]];
      const second = points[connection.edge[1]];

      if (!first || !second) throw new Error('Each matching pair needs an actual cross-edge witness.');

      const amount = Math.max(0, Math.min(1, motion.connection * current.matching.connections.length - index)) * (1 - motion.definitionRetirement);
      drawLine(pen, first.x, first.y, mix(first.x, second.x, amount), mix(first.y, second.y, amount), tones.ink, 1.8);
    }

    for (const [vertex, point] of points.entries()) {
      this.glyph(point, -1, phone ? 4 : 5);

      if (motion.definitionExpansion > .95 && motion.definitionRetirement === 0) {
        const field = this.field(motion);
        const angle = Math.atan2(point.y - field.y, point.x - field.x);
        const distance = field.radius + (phone ? 14 : 17);
        this.text(String(vertex), field.x + distance * Math.cos(angle), field.y + distance * Math.sin(angle), phone ? 10 : 12, true);
      }
    }

    const heading = motion.definitionRetirement > 0 ? 'THE EXACT EXAMPLE RETURNS TO ITS ICON' : 'DEFINITION ON THE EIGHT-DOT EXAMPLE';

    if (phone) this.note(heading, w * .36, 5, w * .66, 9);
    else this.text(heading, w * .5, h * .045, 14);

    if (motion.scene === 'matching' && motion.definitionExpansion === 1) {
      this.text(`${current.matching.cm} DISJOINT EDGES · ${current.matching.connections.length} PAIRS TO JOIN`, w * (phone ? .5 : .76), h * (phone ? .485 : .31), phone ? 10 : 13);
      this.note('ONE CROSS EDGE PER PAIR IS ENOUGH\nALL CROSS EDGES SHOWN ARE ACTUAL LINKS', w * (phone ? .5 : .76), h * (phone ? .525 : .42), w * (phone ? .92 : .40), phone ? 8.5 : 12);
      this.text('COUNTEREXAMPLE ADJACENCIES NOT DRAWN', w * .5, h * (phone ? .77 : .94), phone ? 9 : 12);
    }
  }
}

export function createBranchSetsFilm(root: HTMLElement, context: CanvasRenderingContext2D): FilmDrawing {
  return new BranchSetsFilm(root, context);
}
