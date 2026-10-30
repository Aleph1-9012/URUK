const CLOSED_CARD_WIDTH = 276;
const MIN_CARD_WIDTH = 236;
const SEAL_TILE_WIDTH = 228;

// The tail of paper after the last card, plus the part of the closing roller that shows.
const CLOSED_END_WIDTH = 100;

// The cylinder as it is drawn in the roller artwork, in CSS pixels of its 120px box.
export const ROLLER_CENTRE = 59;
export const ROLLER_RADIUS = 37;

const RULING_ANGLE = 0.1144;
const FIRST_RULING = 0.218;
const RULING_WIDTHS = [[0.104, 0], [0.218, 1], [0.46, 1], [0.58, 1.5], [0.7, 1.5], [0.82, 2], [0.92, 2], [1.045, 1], [1.4, 1]] as const;

// Where the frieze sits on the drawn cylinder: it starts a little behind the sheet and rises towards the far edge.
const FRIEZE_LEAD = 19.5;
const FRIEZE_TOP = 44.5;
const FRIEZE_RISE = 8.5;

// The cap, in pixels of the 2x artwork. The knob's one shading line returns to its drawn place six times a turn.
const CAP_AXIS = 118.5;
const CAP_MIDDLE = 56;
const CAP_FLATTENING = 16 / 74;
const KNOB_CENTRE = 118.5;
const KNOB_RADIUS = 13.5;
const KNOB_RULING_ANGLE = 0.73;
const KNOB_RULING_WIDTH = 0.5;
const KNOB_RULINGS = 6;

export function initialCardIndex(current: number, visible: number, total: number): number {
  return Math.max(0, Math.min(current - Math.floor(visible / 2), total - visible));
}

// The card width when every card fits between the two rollers, or undefined when the roll must run on.
export function closedCardWidth(count: number, available: number): number | undefined {
  const width = Math.min(CLOSED_CARD_WIDTH, (available - CLOSED_END_WIDTH) / Math.max(1, count));

  return width >= MIN_CARD_WIDTH ? width : undefined;
}

// The frieze is rescaled very slightly so that a whole number of seal rollings spans the sheet.
export function wholeSealTile(length: number): number {
  return length / Math.max(1, Math.round(length / SEAL_TILE_WIDTH));
}

// How many whole rows the phone sheet shows. When the list scrolls, rows may grow to fill the sheet.
export function sheetRows(available: number, rowHeight: number, total: number, stretch: boolean) {
  const rows = Math.max(1, Math.min(total, Math.floor(available / rowHeight)));
  const height = stretch && rows < total ? Math.max(rowHeight, available / rows) : rowHeight;

  return { rows, rowHeight: height };
}

// One card turns the roller a whole number of rulings, so it always comes to rest on the approved drawing.
export function rollerTurn(offset: number, tile: number): number {
  return (offset / tile) * Math.round(tile / (ROLLER_RADIUS * RULING_ANGLE));
}

function rulingWidth(angle: number): number {
  const next = RULING_WIDTHS.findIndex(([edge]) => angle < edge);
  const after = RULING_WIDTHS[next];
  const before = RULING_WIDTHS[next - 1];

  if (!after || !before) {
    return 0;
  }

  return before[1] + ((angle - before[0]) / (after[0] - before[0])) * (after[1] - before[1]);
}

// The rulings slide over the cylinder as it turns, thickening towards its shaded edge. Direction -1 is the closing roller.
export function rollerRulings(turn: number, direction: number) {
  const phase = ((turn * direction) % 1 + 1) % 1;
  const rulings: { x: number; width: number }[] = [];

  for (let index = -1; index < 11; index += 1) {
    const angle = FIRST_RULING + (index + phase) * RULING_ANGLE;
    const width = rulingWidth(angle);

    if (width > 0) {
      rulings.push({ x: ROLLER_CENTRE - ROLLER_RADIUS * Math.sin(angle), width });
    }
  }

  return rulings;
}

// A column x of the cylinder shows this fraction of the seal tile. Turning by distance / radius wraps the sheet's frieze around it.
export function friezeColumn(x: number, offset: number, tile: number, direction: number) {
  const angle = Math.asin(Math.max(-1, Math.min(1, (ROLLER_CENTRE - x) / ROLLER_RADIUS)));
  const position = offset - direction * (ROLLER_RADIUS * angle + FRIEZE_LEAD);

  return { source: ((position % tile + tile) % tile) / tile, top: FRIEZE_TOP - FRIEZE_RISE * (1 - Math.cos(angle)) };
}

// The cap makes one whole turn per card, so it comes to rest exactly where it is drawn.
export function capTurns(offset: number, tile: number, direction: number): number {
  return direction * (offset / tile) * Math.max(1, Math.round(tile / (2 * Math.PI * ROLLER_RADIUS)));
}

// Turns a point of the cap about its axis, seen at the drawing's slant, and returns it in CSS pixels.
export function capPoint(column: number, row: number, turns: number) {
  const angle = turns * 2 * Math.PI;
  const across = column - CAP_AXIS;
  const along = (row - CAP_MIDDLE) / CAP_FLATTENING;

  return {
    x: (CAP_AXIS + across * Math.cos(angle) - along * Math.sin(angle)) / 2,
    y: (CAP_MIDDLE + (across * Math.sin(angle) + along * Math.cos(angle)) * CAP_FLATTENING) / 2,
  };
}

// The shading line slides in from the knob's shaded side and fades before it reaches the middle.
export function knobRuling(turns: number) {
  const spacing = (2 * Math.PI) / KNOB_RULINGS;
  const sweep = ((turns * KNOB_RULINGS) % 1 + 1) % 1;
  const angle = sweep < 0.15 ? KNOB_RULING_ANGLE + sweep * spacing : KNOB_RULING_ANGLE + (sweep - 1) * spacing;

  return {
    x: (KNOB_CENTRE + KNOB_RADIUS * Math.sin(angle)) / 2,
    width: KNOB_RULING_WIDTH * Math.max(0, Math.min(1, angle / KNOB_RULING_ANGLE)),
  };
}
