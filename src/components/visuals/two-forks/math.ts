import { ARTICLE_NUMBERS, HEIGHT_THREE_INPUT, HEIGHT_TWO_INPUT, SNAKY } from './data';

export type Cell = readonly [number, number];

export type OrientationIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Placement = { readonly orientation: OrientationIndex; readonly translation: Cell };

type ClaimSets = { readonly id: string; readonly A: readonly Cell[]; readonly T: readonly Cell[]; readonly h: number };

export type BaseClaim = ClaimSets & { readonly kind: 'base'; readonly h: 1; readonly P: readonly Cell[]; readonly missing: Cell };

export type CombinedClaim = ClaimSets & { readonly kind: 'combine'; readonly p: Cell; readonly children: readonly Claim[] };

export type Claim = BaseClaim | CombinedClaim;

export type Turn = {
  readonly player: 'maker' | 'breaker';
  readonly cell: Cell;
  readonly reason: 'pivot' | 'replacement' | 'base' | 'reply';
  readonly nodeId: string;
  readonly maker: readonly Cell[];
  readonly breaker: readonly Cell[];
  readonly boundBefore: number;
  readonly boundAfter: number;
  readonly childId: string | null;
  readonly completed: readonly Cell[] | null;
};

export type Replay = {
  readonly initialMaker: readonly Cell[];
  readonly initialBreaker: readonly Cell[];
  readonly turns: readonly Turn[];
  readonly makerMoves: number;
  readonly breakerMoves: number;
  readonly completed: readonly Cell[];
  readonly unplayedReplies: readonly Cell[];
};

const MATRICES = [
  [[1, 0], [0, 1]], [[0, -1], [1, 0]], [[-1, 0], [0, -1]], [[0, 1], [-1, 0]],
  [[1, 0], [0, -1]], [[-1, 0], [0, 1]], [[0, 1], [1, 0]], [[0, -1], [-1, 0]],
] as const;

function assertCell(cell: Cell): void {
  if (!Number.isInteger(cell[0]) || !Number.isInteger(cell[1])) throw new RangeError('A claimed cell must have two integer lattice coordinates.');
}

export function cellKey(cell: Cell): string {
  return `${cell[0]},${cell[1]}`;
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function sortedCells(cells: Iterable<Cell>): Cell[] {
  const unique = new Map<string, Cell>();

  for (const cell of cells) {
    assertCell(cell);
    unique.set(cellKey(cell), cell);
  }

  return [...unique.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function includesCell(cells: readonly Cell[], cell: Cell): boolean {
  return cells.some(value => sameCell(value, cell));
}

function subset(a: readonly Cell[], b: readonly Cell[]): boolean {
  const keys = new Set(b.map(cellKey));

  return a.every(cell => keys.has(cellKey(cell)));
}

function disjoint(a: readonly Cell[], b: readonly Cell[]): boolean {
  const keys = new Set(b.map(cellKey));

  return a.every(cell => !keys.has(cellKey(cell)));
}

export function placeCell(cell: Cell, placement: Placement): Cell {
  const matrix = MATRICES[placement.orientation];
  const [x, y] = cell;
  const [tx, ty] = placement.translation;

  return [matrix[0][0] * x + matrix[0][1] * y + tx, matrix[1][0] * x + matrix[1][1] * y + ty];
}

export function normalizedCells(cells: readonly Cell[]): Cell[] {
  if (cells.length === 0) throw new Error('An empty placement cannot be normalized as a Snaky.');

  let minX = Infinity;
  let minY = Infinity;

  for (const [x, y] of cells) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
  }

  return sortedCells(cells.map(([x, y]) => [x - minX, y - minY]));
}

export function snakyOrientations(): Cell[][] {
  const unique = new Map<string, Cell[]>();

  for (const orientation of [0, 1, 2, 3, 4, 5, 6, 7] as const) {
    const cells = normalizedCells(SNAKY.map(cell => placeCell(cell, { orientation, translation: [0, 0] })));
    unique.set(cells.map(cellKey).join(';'), cells);
  }

  return [...unique.values()].sort((a, b) => {
    for (let index = 0; index < a.length; index++) {
      const first = a[index];
      const second = b[index];

      if (!first || !second) throw new Error('Each Snaky orientation must contain all six cells.');

      const comparison = first[0] - second[0] || first[1] - second[1];

      if (comparison !== 0) return comparison;
    }

    return 0;
  });
}

export function completedSnaky(maker: readonly Cell[]): Cell[] | null {
  const owned = new Set(maker.map(cellKey));

  for (const orientation of snakyOrientations()) {
    const anchor = orientation[0];

    if (!anchor) throw new Error('A Snaky orientation needs its anchor cell.');

    for (const target of maker) {
      const tx = target[0] - anchor[0];
      const ty = target[1] - anchor[1];
      const cells: Cell[] = orientation.map(([x, y]) => [x + tx, y + ty]);

      if (cells.every(cell => owned.has(cellKey(cell)))) return cells;
    }
  }

  return null;
}

export function baseClaim(id: string, P: readonly Cell[], missing: Cell): BaseClaim {
  const T = sortedCells(P);

  if (T.length !== 6 || !completedSnaky(T) || !includesCell(T, missing)) throw new Error('A base requires one allowed six-cell Snaky and a missing cell belonging to it.');

  const A: Cell[] = [];

  for (const cell of T) {
    if (!sameCell(cell, missing)) A.push(cell);
  }

  return { kind: 'base', id, A, T, h: 1, P: T, missing };
}

export function combineClaims(id: string, children: readonly Claim[], p: Cell): CombinedClaim {
  const first = children[0];

  if (!first) throw new Error('The combination rule requires at least one child claim.');

  assertCell(p);
  const required: Cell[] = [];
  const envelope: Cell[] = [p];
  let height = 0;

  for (const child of children) {
    required.push(...child.A);
    envelope.push(...child.T);
    height = Math.max(height, child.h);
  }

  for (const cell of first.T) {
    if (children.every(child => includesCell(child.T, cell))) required.push(cell);
  }

  const A: Cell[] = [];

  for (const cell of sortedCells(required)) {
    if (!sameCell(cell, p)) A.push(cell);
  }

  return { kind: 'combine', id, A, T: sortedCells(envelope), h: height + 1, p, children };
}

export function transformClaim(id: string, claim: Claim, placement: Placement): Claim {
  if (claim.kind === 'base') return baseClaim(id, claim.P.map(cell => placeCell(cell, placement)), placeCell(claim.missing, placement));

  const children = claim.children.map((child, index) => transformClaim(`${id}/${index}`, child, placement));

  return combineClaims(id, children, placeCell(claim.p, placement));
}

export function assertClaim(claim: Claim): void {
  if (!subset(claim.A, claim.T) || claim.h < 1) throw new Error('A valid toy claim needs a required set inside its envelope and a positive height.');
  if (claim.kind === 'base') {
    if (!completedSnaky(claim.P) || claim.h !== 1 || claim.A.length !== 5 || !subset(claim.A, claim.P)) throw new Error('A toy base must be a Snaky with exactly one required cell missing.');

    return;
  }

  const owned = sortedCells([...claim.A, claim.p]);

  for (const child of claim.children) {
    assertClaim(child);

    if (!subset(child.A, owned) || child.h >= claim.h) throw new Error('The parent pivot must provide all child requirements and decrease the height.');
  }

  for (const reply of claim.T) {
    if (!includesCell(owned, reply) && !claim.children.some(child => !includesCell(child.T, reply))) throw new Error('Every legal in-envelope reply must miss a child envelope.');
  }
}

function assertPosition(claim: Claim, maker: readonly Cell[], breaker: readonly Cell[]): void {
  if (!disjoint(maker, breaker) || !subset(claim.A, maker) || !disjoint(claim.T, breaker)) throw new Error('The toy is conditional on Maker owning A and Breaker missing T, with disjoint ownership.');
}

export function firstFreeCell(maker: readonly Cell[], breaker: readonly Cell[]): Cell {
  const used = new Set([...maker, ...breaker].map(cellKey));

  for (let radius = 0; ; radius++) {
    for (let x = 0 - radius; x <= radius; x++) {
      for (let y = 0 - radius; y <= radius; y++) {
        if (Math.max(Math.abs(x), Math.abs(y)) === radius && !used.has(cellKey([x, y]))) return [x, y];
      }
    }
  }
}

export function outsideReply(claim: Claim, maker: readonly Cell[] = [], breaker: readonly Cell[] = []): Cell {
  let maxX = 0;
  let maxY = 0;

  for (const [x, y] of [...claim.T, ...maker, ...breaker]) {
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [maxX + 2, maxY + 2];
}

function makerChoice(claim: Claim, maker: readonly Cell[], breaker: readonly Cell[]) {
  if (claim.kind === 'base') return { cell: claim.missing, reason: 'base' as const };
  if (!includesCell(maker, claim.p)) return { cell: claim.p, reason: 'pivot' as const };

  return { cell: firstFreeCell(maker, breaker), reason: 'replacement' as const };
}

function childAfterReply(claim: CombinedClaim, breaker: readonly Cell[]): Claim {
  const child = claim.children.find(candidate => disjoint(candidate.T, breaker));

  if (!child) throw new Error('The legal Breaker reply must leave at least one child envelope clear.');

  return child;
}

export function breakerReplyClasses(claim: CombinedClaim, maker: readonly Cell[], breaker: readonly Cell[]) {
  const cases: { kind: 'inside' | 'outside'; cell: Cell; eligibleChildIds: string[] }[] = [];

  function add(kind: 'inside' | 'outside', cell: Cell): void {
    const eligibleChildIds: string[] = [];

    for (const child of claim.children) {
      if (disjoint(child.T, [...breaker, cell])) eligibleChildIds.push(child.id);
    }

    cases.push({ kind, cell, eligibleChildIds });
  }

  for (const cell of claim.T) {
    if (!includesCell(maker, cell) && !includesCell(breaker, cell)) add('inside', cell);
  }

  add('outside', outsideReply(claim, maker, breaker));

  return cases;
}

// Unprovided replies use a declared outside-envelope representative. They are
// scripted continuations, not predictions of an opponent or certificate data.
export function replayPolicy(claim: Claim, initialMaker: readonly Cell[], initialBreaker: readonly Cell[], replies: readonly Cell[] = []): Replay {
  let maker = sortedCells(initialMaker);
  let breaker = sortedCells(initialBreaker);
  assertPosition(claim, maker, breaker);
  let active = claim;
  let makerMoves = 0;
  let breakerMoves = 0;
  const turns: Turn[] = [];

  function finish(completed: readonly Cell[]): Replay {
    return { initialMaker: sortedCells(initialMaker), initialBreaker: sortedCells(initialBreaker), turns, makerMoves, breakerMoves, completed, unplayedReplies: replies.slice(breakerMoves) };
  }

  const alreadyCompleted = completedSnaky(maker);

  if (alreadyCompleted) return finish(alreadyCompleted);

  for (;;) {
    assertPosition(active, maker, breaker);
    const choice = makerChoice(active, maker, breaker);

    if (includesCell(maker, choice.cell) || includesCell(breaker, choice.cell)) throw new Error('Every actual Maker claim, including a replacement, must be fresh.');

    maker = sortedCells([...maker, choice.cell]);
    makerMoves++;
    const completed = completedSnaky(maker);
    turns.push({ player: 'maker', cell: choice.cell, reason: choice.reason, nodeId: active.id, maker, breaker, boundBefore: active.h, boundAfter: active.h - 1, childId: null, completed });

    if (completed) return finish(completed);
    if (active.kind === 'base') throw new Error('A fresh missing base cell must finish its Snaky immediately.');

    const reply = replies[breakerMoves] ?? outsideReply(claim, maker, breaker);
    assertCell(reply);

    if (includesCell(maker, reply) || includesCell(breaker, reply)) throw new Error('Breaker must also claim a fresh cell; play stops immediately after a Maker win.');

    breaker = sortedCells([...breaker, reply]);
    breakerMoves++;
    const child = childAfterReply(active, breaker);
    turns.push({ player: 'breaker', cell: reply, reason: 'reply', nodeId: active.id, maker, breaker, boundBefore: active.h - 1, boundAfter: child.h, childId: child.id, completed: null });
    active = child;
  }
}

function auditWindow(claim: Claim, lo: number, hi: number) {
  let branches = 0;
  let minimumMakerMoves = Infinity;
  let maximumMakerMoves = 0;

  function visit(active: Claim, maker: readonly Cell[], breaker: readonly Cell[], moves: number): void {
    if (completedSnaky(maker)) {
      branches++;
      minimumMakerMoves = Math.min(minimumMakerMoves, moves);
      maximumMakerMoves = Math.max(maximumMakerMoves, moves);

      return;
    }

    const choice = makerChoice(active, maker, breaker);

    if (includesCell(maker, choice.cell) || includesCell(breaker, choice.cell)) throw new Error('The finite-window audit encountered a nonfresh Maker claim.');

    const after = sortedCells([...maker, choice.cell]);

    if (completedSnaky(after)) {
      branches++;
      minimumMakerMoves = Math.min(minimumMakerMoves, moves + 1);
      maximumMakerMoves = Math.max(maximumMakerMoves, moves + 1);

      return;
    }

    if (active.kind === 'base') throw new Error('A base continuation must complete Snaky before another Breaker turn.');

    for (let x = lo; x <= hi; x++) {
      for (let y = lo; y <= hi; y++) {
        const reply: Cell = [x, y];

        if (includesCell(after, reply) || includesCell(breaker, reply)) continue;

        const nextBreaker = sortedCells([...breaker, reply]);
        visit(childAfterReply(active, nextBreaker), after, nextBreaker, moves + 1);
      }
    }
  }

  visit(claim, claim.A, [], 0);

  return { window: [lo, hi] as const, branches, minimumMakerMoves, maximumMakerMoves };
}

function computeTwoForksModel() {
  const children = HEIGHT_TWO_INPUT.children.map((input, index) => baseClaim(`h2/${index}`, SNAKY.map(cell => placeCell(cell, input)), input.missing));
  const height2 = combineClaims('h2', children, HEIGHT_TWO_INPUT.pivot);
  const firstHeight3Child = transformClaim('h3/0', height2, { orientation: 0, translation: [0, 0] });
  const secondHeight3Child = transformClaim('h3/1', height2, HEIGHT_THREE_INPUT.secondChildPlacement);
  const height3 = combineClaims('h3', [firstHeight3Child, secondHeight3Child], HEIGHT_THREE_INPUT.pivot);
  assertClaim(height2);
  assertClaim(height3);
  const height2AfterPivot = sortedCells([...height2.A, height2.p]);
  const height3AfterPivot = sortedCells([...height3.A, height3.p]);

  return {
    snaky: SNAKY,
    orientations: snakyOrientations(),
    height2,
    height3,
    secondHeight2Placement: HEIGHT_THREE_INPUT.secondChildPlacement,
    traces: {
      height2BlockFirst: replayPolicy(height2, height2.A, [], [[2, 0]]),
      height2BlockSecond: replayPolicy(height2, height2.A, [], [[1, 1]]),
      height2Outside: replayPolicy(height2, height2.A, [], [outsideReply(height2)]),
      height3Inside: replayPolicy(height3, height3.A, [], [[0, 0]]),
      height3OtherBranch: replayPolicy(height3, height3.A, [], [[5, 1]]),
      height3Outside: replayPolicy(height3, height3.A, [], [outsideReply(height3)]),
      height2Replacement: replayPolicy(height2, height2AfterPivot, [[-2, -2]], [[2, 0]]),
    },
    replyClasses: {
      height2: breakerReplyClasses(height2, height2AfterPivot, []),
      height3: breakerReplyClasses(height3, height3AfterPivot, []),
    },
    audits: { height2: auditWindow(height2, -1, 9), height3: auditWindow(height3, -1, 6) },
    articleNumbers: ARTICLE_NUMBERS,
  };
}

export type TwoForksModel = ReturnType<typeof computeTwoForksModel>;

let cachedModel: TwoForksModel | undefined;

export function buildTwoForksModel(): TwoForksModel {
  if (!cachedModel) cachedModel = computeTwoForksModel();

  return cachedModel;
}
