import { mix, progress, smooth } from '../../../lib/animation';
import type { FilmLabels } from '../../plate/labels';
import { activeBit, conditionalRun, cubePosition, INITIAL_DECK, OPENING_COINS, shuffleDeck, shufflePositions, singleCardCubeLaw, singleCardLaw, vertexLabel } from './math';
import { SAMPLE_COINS, SAMPLE_DECKS, sampleStepAt } from './motion';
import type { Box } from './story';

type Colors = Record<'ink' | 'blue' | 'muted' | 'paper', string>;

type Point = { x: number; y: number };

const CONDITIONAL = conditionalRun();
const CUBE_DECKS = [SAMPLE_DECKS[12] ?? [...INITIAL_DECK]];

for (let step = 0; step < 3; step++) CUBE_DECKS.push(shuffleDeck(CUBE_DECKS[step] ?? INITIAL_DECK, SAMPLE_COINS[12 + step] ?? OPENING_COINS));

function tag(pen: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colors: Colors, maxWidth: number): void {
  pen.font = `${size}px "Special Elite", monospace`;
  const width = pen.measureText(text).width;

  if (width > maxWidth) pen.font = `${Math.max(9, size * maxWidth / width)}px "Special Elite", monospace`;

  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  const measured = pen.measureText(text).width;
  pen.fillStyle = colors.paper;
  pen.fillRect(x - measured / 2 - 2, y - size * .6, measured + 4, size * 1.2);
  pen.fillStyle = colors.ink;
  pen.fillText(text, x, y);
}

function card(pen: CanvasRenderingContext2D, label: number, point: Point, width: number, colors: Colors, ring = false): void {
  const height = width * 1.3;
  pen.fillStyle = colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .85;
  pen.fillRect(point.x - width / 2, point.y - height / 2, width, height);
  pen.strokeRect(point.x - width / 2, point.y - height / 2, width, height);
  pen.font = `${Math.max(9, width * .6)}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillStyle = colors.ink;
  pen.fillText(String(label), point.x, point.y + 1);

  if (ring) {
    pen.lineWidth = 1.3;
    pen.beginPath();
    pen.ellipse(point.x, point.y, width * .7, height * .68, 0, 0, Math.PI * 2);
    pen.stroke();
  }
}

function coin(pen: CanvasRenderingContext2D, value: number, point: Point, radius: number, colors: Colors): void {
  pen.fillStyle = value === 1 ? colors.ink : colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;
  pen.beginPath();
  pen.arc(point.x, point.y, radius, 0, Math.PI * 2);
  pen.fill();
  pen.stroke();
  pen.fillStyle = value === 1 ? colors.paper : colors.ink;
  pen.font = `${radius * 1.3}px "Special Elite", monospace`;
  pen.textAlign = 'center';
  pen.textBaseline = 'middle';
  pen.fillText(String(value), point.x, point.y + .5);
}

function rowPoint(box: Box, slot: number, y = .43): Point {
  return { x: box.x + (slot + .5) * box.w / 8, y: box.y + box.h * y };
}

function cubePoint(box: Box, vertex: number): Point {
  const scale = Math.min(box.w * .61, box.h * 1.1);
  const x = vertex & 1;
  const y = vertex >> 1 & 1;
  const z = vertex >> 2 & 1;

  return { x: box.x + box.w * .065 + scale * (x + .45 * z), y: box.y + box.h * .83 - scale * (.48 * y + .15 * z) };
}

function segment(pen: CanvasRenderingContext2D, from: Point, to: Point, amount = 1): void {
  pen.beginPath();
  pen.moveTo(from.x, from.y);
  pen.lineTo(mix(from.x, to.x, amount), mix(from.y, to.y, amount));
  pen.stroke();
}

function opening(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const cut = smooth(time, 700, 2200);
  const close = smooth(time, 13000, 14300);
  const width = Math.min(31, box.w / 9.2);
  const pairStarts = [3200, 7750, 9500, 11200] as const;
  tag(pen, time < 7750 ? 'CUT IN HALF · ONE COIN PER PAIR' : 'THORP · 1973', box.x + box.w / 2, box.y + 6, 11, colors, box.w);

  for (let pair = 0; pair < 4; pair++) {
    const start = pairStarts[pair] ?? 0;
    const value = OPENING_COINS[pair] ?? 0;

    if (time >= start - 400 && time < 13000) coin(pen, value, { x: box.x + (pair + .5) * box.w / 4, y: box.y + box.h * .455 }, 7, colors);
  }

  for (const [index, label] of INITIAL_DECK.entries()) {
    const pair = index % 4;
    const top = index < 4;
    const value = OPENING_COINS[pair] ?? 0;
    const slot = pair * 2 + (top ? value : 1 - value);
    const initial = rowPoint(box, index);
    const split = { x: box.x + (pair + .5) * box.w / 4, y: box.y + box.h * (top ? .24 : .65) };
    const first = (top ? value === 0 : value === 1);
    const start = (pairStarts[pair] ?? 0) + (first ? 0 : 370);
    const down = smooth(time, start, start + 1050);
    const output = rowPoint(box, slot, .83);
    const point = { x: mix(mix(initial.x, split.x, cut), output.x, down), y: mix(mix(initial.y, split.y, cut), output.y, down) };
    const final = rowPoint(box, slot);
    point.x = mix(point.x, final.x, close);
    point.y = mix(point.y, final.y, close);
    card(pen, label, point, width, colors);
  }

  if (time >= 13000) tag(pen, 'ONE SAMPLE · 5 1 2 6 3 7 8 4', box.x + box.w / 2, box.y + box.h * .88, 10.5, colors, box.w);
}

function deckStage(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  const step = sampleStepAt(time);
  const counting = time >= 35750 && time < 44000;
  const resetting = counting && step === 0;
  const current = SAMPLE_DECKS[step] ?? INITIAL_DECK;
  const previous = SAMPLE_DECKS[resetting ? 7 : Math.max(0, step - 1)] ?? INITIAL_DECK;
  const start = counting ? (resetting ? 35750 : 36500 + (step - 1) * 1000) : time >= 44000 ? 44000 + (step - 6) * 2000 : step <= 3 ? 14500 + (step - 1) * 2100 : 21000 + (step - 3) * 3500;
  const amount = resetting ? smooth(time, 35750, 36500) : step === 1 && !counting ? 1 : smooth(time, start, start + (counting ? 700 : 1100));
  const phone = box.w < 400;
  const park = phone ? smooth(time, 35750, 36750) * (1 - smooth(time, 41500, 43000)) : 0;
  const width = mix(Math.min(31, box.w / 9.2), 13, park);
  const parkStep = 17;
  const parkX = box.x + (box.w - parkStep * 8) / 2;
  const parkY = box.y + 2;
  const rowY = mix(.43, .34, smooth(time, 14500, 15500));

  for (const [slot, label] of current.entries()) {
    const before = previous.findIndex(card => card === label);
    const from = rowPoint(box, before, rowY);
    const to = rowPoint(box, slot, rowY);
    const point = { x: mix(from.x, to.x, amount), y: to.y + Math.sin(Math.PI * amount) * box.h * (before < 4 ? -.12 : .12) };
    point.x = mix(point.x, parkX + (mix(before, slot, amount) + .5) * parkStep, park);
    point.y = mix(point.y, parkY + Math.sin(Math.PI * amount) * (before < 4 ? -3.5 : 3.5), park);
    card(pen, label, point, width, colors, label === 1 && park < .01 && time < 35750);
  }

  if (park > .5) {
    tag(pen, resetting ? 'RESET' : `SAMPLE ${step}`, box.x + 22, box.y + 8, 9, colors, 48);
    return;
  }

  const title = resetting ? 'RESET THE DECK TO 1–8' : counting ? `ONE SAMPLE · t = ${step}` : `ONE SAMPLE · SHUFFLE ${step}`;
  tag(pen, title, box.x + box.w / 2, box.y + 6, 11, colors, box.w);
  tag(pen, 'LAW OF CARD 1 · EXACT', box.x + box.w / 2, box.y + box.h * .65, 10.5, colors, box.w);
  const law = singleCardLaw(3, step);

  for (const [slot, mass] of law.entries()) {
    const x = box.x + (slot + .5) * box.w / 8;
    const y = box.y + box.h * .78;
    pen.strokeStyle = colors.muted;
    pen.lineWidth = .7;
    pen.strokeRect(x - box.w / 20, y - 8, box.w / 10, 16);

    if (mass > 0) {
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(x, y, 9 * Math.sqrt(mass), 0, Math.PI * 2);
      pen.fill();
    }

    tag(pen, mass === 0 ? '0' : mass === .5 ? '1/2' : mass === .25 ? '1/4' : '1/8', x, box.y + box.h * .92, 10, colors, box.w / 8);
  }

  if (time < 21000) place('decksize', box.x + box.w * .83, box.y + box.h * .20);
}

function cubeEdges(pen: CanvasRenderingContext2D, box: Box, time: number, bit: number, colors: Colors, separation = 0): void {
  const built = progress(time, 59500, 61100);

  for (let direction = 0; direction < 3; direction++) {
    pen.strokeStyle = direction === bit ? colors.ink : colors.muted;
    pen.lineWidth = direction === bit ? 1.8 : .65;

    for (let vertex = 0; vertex < 8; vertex++) {
      if (vertex & 1 << direction) continue;

      const other = vertex ^ 1 << direction;
      const from = cubePoint(box, vertex);
      const to = cubePoint(box, other);
      const shiftFrom = (vertex & 1 << bit ? 1 : -1) * separation;
      const shiftTo = (other & 1 << bit ? 1 : -1) * separation;
      segment(pen, { x: from.x + shiftFrom, y: from.y }, { x: to.x + shiftTo, y: to.y }, built);
    }
  }
}

function vertexLabels(pen: CanvasRenderingContext2D, box: Box, colors: Colors, separation = 0, bit = 0): void {
  for (let vertex = 0; vertex < 8; vertex++) {
    const point = cubePoint(box, vertex);
    const wantedX = point.x + (vertex & 1 ? 10 : -9) + (vertex & 1 << bit ? 1 : -1) * separation;
    const x = Math.max(box.x + 13, Math.min(box.x + box.w - 13, wantedX));
    const y = point.y + (vertex & 2 ? -10 : 12);
    tag(pen, vertexLabel(vertex), x, y, 10, colors, 26);
  }
}

function cubeSample(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const morph = smooth(time, 59500, 61100);
  const step = Math.min(2, Math.max(0, Math.floor((time - 61700) / 2000)));
  const start = 61700 + step * 2000;
  const amount = smooth(time, start, start + 1300);
  const bit = activeBit(3, step);
  const coins = SAMPLE_COINS[12 + step] ?? OPENING_COINS;
  const before = CUBE_DECKS[step] ?? INITIAL_DECK;
  const target = shufflePositions(8, coins);
  cubeEdges(pen, box, time, bit, colors);

  for (let slot = 0; slot < 8; slot++) {
    const label = before[slot] ?? 1;
    const old = cubePoint(box, cubePosition(slot, 3, step));
    const next = cubePoint(box, cubePosition(target[slot] ?? slot, 3, step + 1));
    const to = { x: mix(old.x, next.x, amount), y: mix(old.y, next.y, amount) };
    const initial = rowPoint(box, slot, .34);
    const point = { x: mix(initial.x, to.x, morph), y: mix(initial.y, to.y, morph) };
    card(pen, label, point, mix(Math.min(31, box.w / 9.2), 14, morph), colors);
  }

  if (morph > .99) {
    vertexLabels(pen, box, colors);

    for (let pair = 0; pair < 4; pair++) {
      const from = cubePoint(box, cubePosition(pair, 3, step));
      const to = cubePoint(box, cubePosition(pair + 4, 3, step));
      coin(pen, coins[pair] ?? 0, { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, 5, colors);
    }
  }

  tag(pen, morph < .99 ? 'SLOTS BECOME BINARY VERTICES' : `SWITCH LAYER ${step + 1} · BIT ${bit}`, box.x + box.w / 2, box.y + 5, 11, colors, box.w);
}

function massDot(pen: CanvasRenderingContext2D, point: Point, mass: number, colors: Colors): void {
  if (mass <= 1e-12) return;

  pen.fillStyle = colors.ink;
  pen.beginPath();
  pen.arc(point.x, point.y, 13 * Math.sqrt(mass), 0, Math.PI * 2);
  pen.fill();
}

function oneCardSweep(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const step = Math.min(2, Math.max(0, Math.floor((time - 69200) / 1900)));
  const amount = smooth(time, 69200 + step * 1900, 70300 + step * 1900);
  const bit = activeBit(3, step);
  const law = singleCardCubeLaw(3, step);
  cubeEdges(pen, box, time, bit, colors);
  vertexLabels(pen, box, colors);

  for (const [vertex, mass] of law.entries()) {
    const from = cubePoint(box, vertex);
    const to = cubePoint(box, vertex ^ 1 << bit);
    massDot(pen, from, mass * (1 - amount / 2), colors);
    massDot(pen, { x: mix(from.x, to.x, amount), y: mix(from.y, to.y, amount) }, mass * amount / 2, colors);
  }

  tag(pen, 'ONE-CARD LAW FROM 000 · EXACT', box.x + box.w / 2, box.y + 5, 11, colors, box.w);
  tag(pen, step === 2 && amount === 1 ? 'd = 3 · UNIFORM AFTER THREE' : `AVERAGE ALONG BIT ${bit}`, box.x + box.w / 2, box.y + box.h * .99, 10.5, colors, box.w);
}

function conditionalClock(time: number): number {
  if (time < 84200) return Math.min(6, Math.max(0, (time - 76800) / 1200));

  return mix(6, 4, smooth(time, 84200, 85600));
}

function conditional(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const clock = time >= 85750 ? 4 : conditionalClock(time);
  const step = Math.min(6, Math.floor(clock));
  const amount = clock - step;
  const frame = CONDITIONAL[step] ?? CONDITIONAL[0];
  const next = CONDITIONAL[Math.min(6, step + 1)] ?? frame;

  if (!frame || !next) return;

  const bit = frame.activeBit;
  const split = time >= 85750 ? Math.sin(Math.PI * progress(time, 87200, 90300)) * box.w * .025 : 0;
  const pointAt = (vertex: number): Point => {
    const point = cubePoint(box, vertex);
    point.x += (vertex & 1 << bit ? 1 : -1) * split;

    return point;
  };

  cubeEdges(pen, box, time, bit, colors, split);
  vertexLabels(pen, box, colors, split, bit);
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 2.6;

  for (let index = 1; index <= Math.min(6, Math.ceil(clock)); index++) {
    const from = pointAt(CONDITIONAL[index - 1]?.exposedCube ?? 0);
    const to = pointAt(CONDITIONAL[index]?.exposedCube ?? 0);
    segment(pen, from, to, index <= step ? 1 : amount);
  }

  for (let vertex = 0; vertex < 8; vertex++) {
    const point = pointAt(vertex);

    if (amount === 0 || amount === 1) {
      massDot(pen, point, (amount === 0 ? frame : next).lawCube[vertex] ?? 0, colors);
    } else {
      const mass = frame.lawCube[vertex] ?? 0;

      if (vertex === frame.partnerCube) {
        const target = pointAt(next.exposedCube ^ 1 << bit);
        massDot(pen, { x: mix(point.x, target.x, amount), y: mix(point.y, target.y, amount) }, mass, colors);
      } else {
        const target = pointAt(vertex ^ 1 << bit);
        massDot(pen, point, mass * (1 - amount / 2), colors);
        massDot(pen, { x: mix(point.x, target.x, amount), y: mix(point.y, target.y, amount) }, mass * amount / 2, colors);
      }
    }

    if (time >= 85750 && vertex !== frame.exposedCube) {
      const value = frame.centeredCube[vertex] ?? 0;
      pen.strokeStyle = colors.ink;
      pen.lineWidth = 2;
      segment(pen, { x: point.x + 7, y: point.y }, { x: point.x + 7, y: point.y - value * 120 });
    }
  }

  const from = pointAt(frame.exposedCube);
  const to = pointAt(next.exposedCube);
  pen.fillStyle = colors.paper;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = 1.7;
  pen.beginPath();
  pen.arc(mix(from.x, to.x, amount), mix(from.y, to.y, amount), 6.5, 0, Math.PI * 2);
  pen.fill();
  pen.stroke();
  const displayedStep = amount > 0 ? step + 1 : step;
  tag(pen, time >= 84200 && time < 85750 ? 'REPLAY STEP 4' : `ONE EXPOSED CARD · STEP ${displayedStep}`, box.x + box.w / 2, box.y + 5, 11, colors, box.w);

  if (time >= 85750) {
    tag(pen, 'LEVEL 1/7 · AFTER 4 · EXACT', box.x + box.w / 2, box.y + box.h, 10, colors, box.w);
  } else {
    tag(pen, step === 0 ? 'FOLLOWS · NO SPLIT' : 'FREE SWITCHES AVERAGE · EXACT LAW', box.x + box.w / 2, box.y + box.h * .99, 10, colors, box.w);
  }
}

function blocks(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const toRow = smooth(time, 101000, 102400);
  const deck = CUBE_DECKS[3] ?? INITIAL_DECK;
  const omitted = time < 101000 ? 7 : Math.min(7, Math.floor((time - 101000) / 780));
  cubeEdges(pen, box, time, -1, colors);

  for (const [slot, label] of deck.entries()) {
    const point = cubePoint(box, cubePosition(slot, 3, 3));
    const target = rowPoint(box, slot, .45);
    point.x = mix(point.x, target.x, toRow);
    point.y = mix(point.y, target.y, toRow);
    card(pen, label, point, mix(15, Math.min(27, box.w / 10), toRow), colors, slot !== omitted);
  }

  tag(pen, time < 101000 ? '7n/8 CARDS · SCHEMATIC' : 'EIGHT BLOCKS · SCHEMATIC', box.x + box.w / 2, box.y + 5, 11, colors, box.w);
}

function closing(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const final = CUBE_DECKS[3] ?? INITIAL_DECK;
  const coins = SAMPLE_COINS[16] ?? OPENING_COINS;
  const shuffled = shuffleDeck(final, coins);
  const amount = smooth(time, 110000, 113000);

  for (const [slot, label] of shuffled.entries()) {
    const before = final.findIndex(card => card === label);
    const from = rowPoint(box, before, .45);
    const to = rowPoint(box, slot, .45);
    const point = { x: mix(from.x, to.x, amount), y: to.y + Math.sin(Math.PI * amount) * box.h * (before < 4 ? -.18 : .18) };
    card(pen, label, point, Math.min(29, box.w / 9.2), colors);
  }

  tag(pen, 'UNREVIEWED', box.x + box.w / 2, box.y + 7, 14, colors, box.w);
  tag(pen, '13 LEAN STATEMENTS · 4 CATALOGUED', box.x + box.w / 2, box.y + box.h * .80, 10, colors, box.w);
  tag(pen, 'THE HEADLINE’S OWN IS NOT', box.x + box.w / 2, box.y + box.h * .93, 10, colors, box.w);
}

export function drawStage(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: FilmLabels['place']): void {
  if (time < 14500) opening(pen, box, time, colors);
  else if (time < 59500) deckStage(pen, box, time, colors, place);
  else if (time < 68250) cubeSample(pen, box, time, colors);
  else if (time < 76000) oneCardSweep(pen, box, time, colors);
  else if (time < 94250) conditional(pen, box, time, colors);
  else if (time < 108000) blocks(pen, box, time, colors);
  else closing(pen, box, time, colors);
}
