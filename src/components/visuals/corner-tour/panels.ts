import { type Box, type Colors, type Place, line, text } from './drawing';
import type { CornerModel } from './math';
import { solidAt } from './story';

function claimRing(pen: CanvasRenderingContext2D, x: number, y: number, colors: Colors, radius: number): void {
  pen.strokeStyle = colors.blue;
  pen.lineWidth = 2.5;
  pen.beginPath();
  pen.arc(x, y, radius, 0, Math.PI * 2);
  pen.stroke();
}

function datedLedger(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors): void {
  const entries = [
    { at: 18750, year: '1884', name: 'TAIT' },
    { at: 30000, year: '1969', name: 'BARNETTE' },
    { at: 40000, year: '1975', name: 'GOODEY' },
    { at: 47000, year: '2025', name: 'SCHNIEDERS' },
    { at: 55500, year: '2026', name: 'OPENAI · CLAIMED' },
  ];
  const y = box.y + 13;
  const firstX = box.x + box.w * .12;
  let previous = firstX;
  pen.strokeStyle = colors.ink;
  pen.lineWidth = .8;

  for (const [index, entry] of entries.entries()) {
    if (time < entry.at) break;

    const x = box.x + box.w * (.12 + index * .19);
    line(pen, previous, y, x, y);

    if (index === 4) claimRing(pen, x, y, colors, 9);
    else {
      pen.strokeStyle = colors.ink;
      pen.fillStyle = colors.ink;
      pen.beginPath();
      pen.arc(x, y, 2.2, 0, Math.PI * 2);
      pen.fill();
    }

    text(pen, entry.year, x, y - 14, 12, box.w * .15, colors);
    text(pen, entry.name, x, y + 19, 11, box.w * .18, colors);
    previous = x;
    pen.strokeStyle = colors.ink;
    pen.lineWidth = .8;
  }
}

function phoneClaim(pen: CanvasRenderingContext2D, box: Box, colors: Colors): void {
  const x = box.x + box.w / 2;
  text(pen, 'CLAIMED', x - 9, box.y + 7, 10, 84, colors);
  claimRing(pen, x + 35, box.y + 7, colors, 7);
}

function tagRows(pen: CanvasRenderingContext2D, box: Box, rows: readonly string[], colors: Colors, tall: boolean, top: number, primarySize?: number): void {
  const x = box.x + box.w / 2;
  const spacing = tall ? 20 : 25;

  for (const [index, row] of rows.entries()) {
    const size = index === 0 && primarySize !== undefined ? primarySize : tall ? 10.5 : 15;
    text(pen, row, x, box.y + top + index * spacing, size, box.w - 5, colors);
  }
}

export function drawPanels(pen: CanvasRenderingContext2D, box: Box, time: number, colors: Colors, place: Place, model: CornerModel, tall: boolean): void {
  pen.setLineDash([]);
  const claimed = time >= 55500;

  if (tall && claimed) phoneClaim(pen, box, colors);
  else if (!tall && time >= 18750) datedLedger(pen, box, time, colors);

  const top = tall ? claimed ? 35 : 15 : time >= 18750 ? 66 : 27;
  const episode = solidAt(time);

  if (time < 9750) {
    tagRows(pen, box, ['3 EDGES AT EVERY CORNER', 'EVERY FACE EVEN: 4 SIDES'], colors, tall, top, tall ? 12 : 19);

    return;
  }

  if (time < 18750) {
    const count = model.solids.cube.tours.length;
    tagRows(pen, box, [`THE CUBE HAS ${count} SUCH TOURS`, 'EVERY CORNER ONCE · BACK TO THE START'], colors, tall, top, tall ? 13 : 21);

    return;
  }

  if (time < 30000) {
    tagRows(pen, box, ['TAIT 1884: THREE EDGES AT EACH CORNER', 'FALSE: TUTTE 1946 · ODD FACES'], colors, tall, top, tall ? 10.5 : 17);

    return;
  }

  if (time < 40000) {
    tagRows(pen, box, ['BARNETTE 1969 · EVEN FACES', 'TWO ALTERNATING CORNER KINDS'], colors, tall, top, tall ? 11 : 17);

    return;
  }

  if (time < 47000) {
    const count = model.solids.hexagonal_prism.tours.length;
    const rows = episode.transition ? ['GOODEY 1975 · SQUARES AND HEXAGONS'] : ['GOODEY 1975 · SQUARES AND HEXAGONS', `THIS PRISM: ${count} TOURS`];
    tagRows(pen, box, rows, colors, tall, top, tall ? 10.5 : 17);

    return;
  }

  if (time < 55500) {
    const count = model.solids.truncated_octahedron.tours.length;
    const rows = ['SCHNIEDERS 2025 · FACES UP TO 8 SIDES', 'COMPUTERS: A FEW DOZEN CORNERS'];

    if (!episode.transition) rows.push(`THIS SOLID: ${count} TOURS`);

    tagRows(pen, box, rows, colors, tall, top, tall ? 10 : 16);

    return;
  }

  if (time < 64500) {
    const rows = tall ? ['EVERY CUBIC, BIPARTITE,', 'PLANAR, 3-CONNECTED GRAPH', 'HAS A TOUR'] : ['CLAIMED: EVERY CUBIC, BIPARTITE, PLANAR,', '3-CONNECTED GRAPH HAS A TOUR'];
    tagRows(pen, box, rows, colors, tall, top, tall ? 11 : 18);

    return;
  }

  if (time < 78000) {
    tagRows(pen, box, ['INSIDE: A TREE · OUTSIDE: A TREE', 'THE TOUR IS THEIR BORDER'], colors, tall, top, tall ? 10.5 : 17);

    if (!episode.transition) place('dual-t', box.x + box.w / 2, box.y + top + (tall ? 40 : 50));

    return;
  }

  if (time < 86000) {
    tagRows(pen, box, ['EVERY EDGE: SOME TOUR AVOIDS IT', 'CHECKED ON ALL THREE SOLIDS'], colors, tall, top, tall ? 11 : 18);

    return;
  }

  if (time < 94500) {
    tagRows(pen, box, ['EXISTENCE PROOF', 'NO FAST RECIPE CLAIMED'], colors, tall, top, tall ? 13 : 20);

    return;
  }

  tagRows(pen, box, ['UNREVIEWED', 'AS OF 20 OCTOBER 2026'], colors, tall, top + (tall ? 9 : 4), tall ? 21 : 28);
}
