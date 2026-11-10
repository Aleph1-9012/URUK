import { mix, progress, smooth } from '../../../lib/animation';
import { FilmLabels } from '../../plate/labels';
import { FAMILY_EXAMPLES } from './data';
import { type Box, type Colors, type Place, line, text } from './drawing';
import { createArtinModel, gates, orbit, type ArtinModel, type Orbit } from './math';
import { drawPanel } from './panels';

type Clock = { orbit: Orbit; since: number; until: number };

const CLOCKS: Clock[] = [
  { orbit: orbit(2, 11), since: 0, until: 6500 },
  { orbit: orbit(2, 7), since: 14000, until: 18500 },
  { orbit: orbit(4, 11), since: 19500, until: 27000 },
  { orbit: orbit(2, 11), since: 29750, until: 32000 },
  { orbit: orbit(2, 31), since: 38250, until: 44300 },
  { orbit: orbit(2, 13), since: 61000, until: 66300 },
  { orbit: orbit(2, 11), since: 110250, until: 112500 },
];

function clockAt(time: number): { current: Clock; previous: Clock; morph: number; walked: number } {
  let index = 0;

  for (let candidate = 1; candidate < CLOCKS.length; candidate++) {
    const clock = CLOCKS[candidate];

    if (clock && time >= clock.since) index = candidate;
  }

  const current = CLOCKS[index];
  const previous = CLOCKS[Math.max(0, index - 1)];

  if (!current || !previous) throw new Error('The clock timeline has an opening state.');

  const morph = index === 0 ? 1 : smooth(time, current.since, current.since + 850);
  const walked = progress(time, current.since + (index === 0 ? 500 : 1000), current.until) * current.orbit.order;

  return { current, previous, morph, walked };
}

function layout(width: number, height: number, time: number): { clock: Box; gates: Box; panel: Box; tall: boolean } {
  const tall = width < 600;

  if (!tall) {
    return {
      clock: { x: width * .025, y: height * .025, w: width * .445, h: height * .68 },
      gates: { x: width * .025, y: height * .72, w: width * .445, h: height * .25 },
      panel: { x: width * .515, y: height * .035, w: width * .45, h: height * .93 },
      tall,
    };
  }

  let compact = 0;

  if (time >= 29750 && time < 38250) compact = smooth(time, 29750, 30600);
  if (time >= 45750 && time < 61000) compact = smooth(time, 45750, 46600);
  if (time >= 67000) compact = smooth(time, 67000, 67850);

  const family = smooth(time, 84250, 85100) * (1 - smooth(time, 93250, 94100));
  const panelTop = mix(.58, .49, compact) - family * .19;
  const clock = { x: width * .05, y: height * .012, w: width * .90, h: height * (panelTop - .185) };
  const baseGateY = height * (panelTop - .135);
  const familyGateY = clock.y + clock.h / 2 + 35;
  const gateY = mix(baseGateY, familyGateY, family);
  const panelY = mix(height * panelTop, gateY + 80, family);

  return {
    clock,
    gates: { x: width * .05, y: gateY, w: width * .90, h: height * .12 },
    panel: { x: width * .055, y: time < 38250 ? height * Math.min(panelTop, .48) : panelY, w: width * .89, h: time < 38250 ? height * .50 : height * .98 - panelY },
    tall,
  };
}

function point(residue: number, prime: number, cx: number, cy: number, radius: number): { x: number; y: number } {
  const angle = residue / prime * Math.PI * 2 - Math.PI / 2;

  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function drawClock(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const { current, previous, morph, walked } = clockAt(time);
  const { prime, base, residues, order } = current.orbit;
  const radius = Math.max(26, Math.min(box.w * .37, (box.h - 41) / 2));
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2 + 3;
  const numberSize = tall ? (prime === 31 ? 10 : 12) : 16;
  const tickCount = Math.max(prime, previous.orbit.prime);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  pen.beginPath();
  pen.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(.005, smooth(time, 0, 650)));
  pen.stroke();

  for (let value = 0; value < tickCount; value++) {
    if (morph === 1 && value >= prime) continue;

    const a = point(value % previous.orbit.prime, previous.orbit.prime, cx, cy, radius);
    const b = point(value % prime, prime, cx, cy, radius);
    const x = mix(a.x, b.x, morph);
    const y = mix(a.y, b.y, morph);
    const visited = value > 0 && residues.indexOf(value) >= 0 && residues.indexOf(value) <= Math.floor(walked);
    const tickRadius = value >= prime ? mix(2.4, 0, morph) : (visited ? 3.1 : 2.4);
    pen.fillStyle = visited ? colors.ink : colors.paper;
    pen.strokeStyle = colors.ink;
    pen.beginPath();
    pen.arc(x, y, tickRadius, 0, Math.PI * 2);
    pen.fill();
    pen.stroke();

    if (value < prime && (prime !== 31 || !tall || value % 5 === 0 || visited)) {
      const label = point(value, prime, cx, cy, radius + (tall ? 13 : 19));

      if (prime === 31 && tall) {
        const leaders = new Map([
          [30, { x: cx - 29, y: cy - radius - 16 }],
          [0, { x: cx - 5, y: cy - radius - 14 }],
          [1, { x: cx + 20, y: cy - radius - 14 }],
          [2, { x: cx + 39, y: cy - radius - 10 }],
          [15, { x: cx + 47, y: cy + radius + 11 }],
          [16, { x: cx - 47, y: cy + radius + 11 }],
        ]);
        const target = leaders.get(value);

        if (target) {
          line(pen, b.x, b.y, target.x, target.y);
          label.x = target.x;
          label.y = target.y;
        }
      }

      text(pen, String(value), label.x, label.y, numberSize, 26, colors);
    }
  }

  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.3;

  if (morph < 1) {
    const start = residues[0];

    if (start === undefined) throw new Error('A clock morph has a destination bead.');

    const target = point(start, prime, cx, cy, radius);

    for (let index = 0; index < previous.orbit.order; index++) {
      const from = previous.orbit.residues[index];
      const to = previous.orbit.residues[(index + 1) % previous.orbit.order];

      if (from === undefined || to === undefined) throw new Error('Previous chords join existing residues.');

      const a = point(from, previous.orbit.prime, cx, cy, radius);
      const b = point(to, previous.orbit.prime, cx, cy, radius);
      line(pen, mix(a.x, target.x, morph), mix(a.y, target.y, morph), mix(b.x, target.x, morph), mix(b.y, target.y, morph));
    }
  }

  for (let index = 0; index < Math.ceil(walked); index++) {
    const fromResidue = residues[index % order];
    const toResidue = residues[(index + 1) % order];
    const oldFrom = previous.orbit.residues[index % previous.orbit.order];
    const oldTo = previous.orbit.residues[(index + 1) % previous.orbit.order];

    if (fromResidue === undefined || toResidue === undefined || oldFrom === undefined || oldTo === undefined) throw new Error('Orbit chords join existing residues.');

    const from = point(fromResidue, prime, cx, cy, radius);
    const to = point(toResidue, prime, cx, cy, radius);
    const a = point(oldFrom, previous.orbit.prime, cx, cy, radius);
    const b = point(oldTo, previous.orbit.prime, cx, cy, radius);
    const amount = Math.min(1, Math.max(0, walked - index));
    line(pen, mix(a.x, from.x, morph), mix(a.y, from.y, morph), mix(b.x, to.x, morph), mix(b.y, to.y, morph), amount);
  }

  const step = Math.floor(walked);
  const remainder = residues[step % order];
  const next = residues[(step + 1) % order];

  if (remainder === undefined || next === undefined) throw new Error('Every clock has a nonempty orbit.');

  const a = point(remainder, prime, cx, cy, radius);
  const b = point(next, prime, cx, cy, radius);
  const fraction = walked - step;
  const oldStart = previous.orbit.residues[0];

  if (oldStart === undefined) throw new Error('The previous clock has a bead position.');

  const oldBead = point(oldStart, previous.orbit.prime, cx, cy, radius);
  const beadX = mix(oldBead.x, mix(a.x, b.x, fraction), morph);
  const beadY = mix(oldBead.y, mix(a.y, b.y, fraction), morph);
  pen.fillStyle = colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 2;
  pen.beginPath();
  pen.arc(beadX, beadY, 5, 0, Math.PI * 2);
  pen.fill();
  pen.stroke();
  text(pen, `MOD ${prime} · × ${base}`, cx, cy - (time >= 14000 ? 8 : 0), tall ? 11 : 17, radius * 1.6, colors);

  if (time < 14000) {
    const shown = residues.slice(0, Math.min(order, Math.ceil(walked) + 1)).join(' → ');
    text(pen, shown, cx, box.y + 8, tall ? 11 : 17, box.w - 8, colors);

    if (time >= 2200 && time < 6500) text(pen, '8 × 2 = 16 → 5', cx, box.y + box.h - 7, tall ? 11 : 16, box.w, colors);
  } else {
    const tag = base === 4 ? '4 = 2² · ORDER 5 OF 10' : prime === 31 ? 'ORDER 5 · INDEX 6' : prime === 7 ? 'ORDER 3 OF 6 · CLOSES EARLY' : `ORDER ${order} = ${prime} − 1`;
    text(pen, tag, cx, cy + (tall ? 12 : 20), tall ? 9 : 13, radius * 1.8, colors);
  }
}

function superscript(value: number): string {
  const digits = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  return String(value).split('').map(digit => digits[Number(digit)]).join('');
}

function drawUnrolledClock(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, tall: boolean): void {
  const amount = smooth(time, 84250, 85250);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const radius = Math.max(26, Math.min(box.w * .37, (box.h - 41) / 2));
  const left = box.x + box.w * .08;
  const width = box.w * .84;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1;
  pen.beginPath();

  for (let sample = 0; sample <= 80; sample++) {
    const old = point(sample / 80 * 13, 13, cx, cy, radius);
    const x = mix(old.x, left + sample / 80 * width, amount);
    const y = mix(old.y, cy, amount);

    if (sample === 0) pen.moveTo(x, y);
    else pen.lineTo(x, y);
  }

  pen.stroke();
  const factors = [2, 11, 13, Number(FAMILY_EXAMPLES.open.largeFactor)];
  const labels = ['2', '11', '13', 'Q'];
  const total = factors.reduce((sum, value) => sum + Math.log(value), 0);
  let cumulative = 0;

  for (const [index, factor] of factors.entries()) {
    const x = left + cumulative / total * width;
    const next = left + (cumulative + Math.log(factor)) / total * width;
    line(pen, x, cy - 7 * amount, x, cy + 7 * amount);
    const labelX = index < 3 ? left + index * (tall ? 29 : 43) : (x + next) / 2;

    if (amount === 1 && !tall) {
      line(pen, (x + next) / 2, cy - 5, labelX, cy - 22);
      text(pen, labels[index] ?? 'Q', labelX, cy - 28, tall ? 11 : 17, 35, colors);
    }

    cumulative += Math.log(factor);
  }

  line(pen, left + width, cy - 7 * amount, left + width, cy + 7 * amount);
  if (!tall) text(pen, 'p − 1: TOO MANY TICKS TO DRAW', cx, cy + 39, 13, box.w, colors);

  text(pen, tall ? 'p − 1: TOO MANY TICKS · SCHEMATIC' : 'SCHEMATIC UNROLLING · LOG FACTOR WIDTHS', cx, box.y + 5, tall ? 8.5 : 12, box.w, colors);
}

function drawGates(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, model: ArtinModel, tall: boolean, place: Place): void {
  if (time < 38250 || time >= 110250) return;

  const family = time >= 84250;
  const familyScene = family && time < 93250;
  const secondExample = family && time >= 89250;
  const prime = time < 61000 ? 31 : 13;
  const small = gates(2, prime);
  const familyGates = secondExample ? model.family.closed : model.family.open;
  const rows = family ? familyGates.map(gate => ({ label: gate.q > 13n ? 'Q' : String(gate.q), closed: gate.closed, test: gate.closed ? 'SHUT' : 'OPEN' })) : small.map(gate => ({ label: String(gate.q), closed: gate.closed, test: `2${superscript(gate.exponent)} ≡ ${gate.remainder}` }));
  const font = tall ? 9.5 : 13;
  const centreY = familyScene && tall ? box.y + 29 : box.y + box.h * .56;
  const step = box.w / rows.length;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .9;

  if (family) {
    text(pen, secondExample ? 'SECOND EXAMPLE · GATE 11 SHUT' : 'FIRST EXAMPLE · ALL GATES OPEN', box.x + box.w / 2, box.y - (tall ? 7 : 13), tall ? 9 : 12, box.w, colors);

    if (!familyScene || !tall) text(pen, 'GATE 2: (2/p) = −1 · OPEN', box.x + box.w / 2, box.y + (tall ? 17 : 29), tall ? 9.5 : 13, box.w, colors);
  }

  for (const [index, gate] of rows.entries()) {
    const x = box.x + step * (index + .5);
    const half = Math.min(16, step * .22);
    const h = tall ? 12 : 19;
    line(pen, x - half, centreY + h / 2, x - half, centreY - h / 2);
    line(pen, x + half, centreY + h / 2, x + half, centreY - h / 2);
    line(pen, x - half, centreY - h / 2, x + half, centreY - h / 2);

    if (gate.closed) {
      line(pen, x - half + 3, centreY + h / 2 - 2, x + half - 3, centreY - h / 2 + 2);
    } else {
      line(pen, x - half + 3, centreY + h / 2, x - half - 5, centreY - h / 2 + 3);
    }

    text(pen, `q = ${gate.label}`, x, box.y + (familyScene && tall ? 11 : family && tall ? 1 : 2), font, step - 4, colors);
    const readout = family ? gate.test : `${gate.test} · ${gate.closed ? 'SHUT' : 'OPEN'}`;
    const readoutY = familyScene ? tall ? box.y + 44 : box.y + box.h - 35 : box.y + box.h - 3;
    text(pen, readout, x, readoutY, font - .5, step - 3, colors);
  }

  if (familyScene) {
    const conditionY = tall ? box.y + 63 : box.y + box.h - 8;

    if (secondExample) place('family-gate-eleven', box.x + box.w / 2, conditionY);
    else if (tall) text(pen, 'GATE 2: (2/p) = −1 · OPEN', box.x + box.w / 2, conditionY, 9.5, box.w, colors);
  }
}

export function createRemainderClock(root: HTMLElement, canvas: HTMLCanvasElement, pen: CanvasRenderingContext2D) {
  const labels = new FilmLabels(root, { horizontal: 5, vertical: 4 });
  const model = createArtinModel();
  const colors: Colors = { ink: '#28241f', blue: '#28486e', muted: '#5f584d', paper: '#e7e5e0' };
  let width = 1;
  let height = 1;
  let density = 1;

  return {
    resize(nextWidth: number, nextHeight: number, nextDensity: number): void {
      width = nextWidth;
      height = nextHeight;
      density = nextDensity;
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      const style = getComputedStyle(root);

      for (const tone of ['ink', 'blue', 'muted', 'paper'] as const) colors[tone] = style.getPropertyValue(`--${tone}`).trim() || colors[tone];

      labels.resize(width, height);
    },
    draw(time: number): void {
      const boxes = layout(width, height, time);
      labels.beginFrame();
      pen.setTransform(density, 0, 0, density, 0, 0);
      pen.clearRect(0, 0, width, height);
      pen.lineCap = 'round';
      pen.lineJoin = 'round';
      if (time >= 84250 && time < 110250) drawUnrolledClock(pen, boxes.clock, time, colors, boxes.tall);
      else drawClock(pen, boxes.clock, time, colors, boxes.tall);
      drawGates(pen, boxes.gates, time, colors, model, boxes.tall, labels.place);
      drawPanel(pen, boxes.panel, time, colors, labels.place, model, boxes.tall);

      labels.endFrame();
    },
  };
}
