import { expect, test } from 'bun:test';
import { buildTwoForksModel, completedSnaky, normalizedCells, placeCell, replayPolicy, type Cell, type Claim, type Replay } from './math';

function keys(cells: readonly Cell[]): string[] {
  return cells.map(([x, y]) => `${x},${y}`).sort();
}

function independentOrientations(): Cell[][] {
  const reference: Cell[] = [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [4, 1]];
  const results: Cell[][] = [];

  for (const reflection of [-1, 1]) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const cosine = Math.round(Math.cos(quarter * Math.PI / 2));
      const sine = Math.round(Math.sin(quarter * Math.PI / 2));
      const cells: Cell[] = reference.map(([x, y]) => [cosine * x - sine * y * reflection, sine * x + cosine * y * reflection]);
      results.push(cells);
    }
  }

  return results;
}

function independentWin(maker: readonly Cell[]): boolean {
  const owned = new Set(keys(maker));

  for (const placement of independentOrientations()) {
    const anchor = placement[0];

    if (!anchor) throw new Error('The reference target needs its anchor.');

    for (const [x, y] of maker) {
      const tx = x - anchor[0];
      const ty = y - anchor[1];

      if (placement.every(([u, v]) => owned.has(`${u + tx},${v + ty}`))) return true;
    }
  }

  return false;
}

function independentFirstFree(maker: readonly Cell[], breaker: readonly Cell[]): Cell {
  const occupied = new Set([...keys(maker), ...keys(breaker)]);
  const candidates: Cell[] = [];

  for (let x = -10; x <= 10; x++) {
    for (let y = -10; y <= 10; y++) candidates.push([x, y]);
  }

  candidates.sort((a, b) => Math.max(Math.abs(a[0]), Math.abs(a[1])) - Math.max(Math.abs(b[0]), Math.abs(b[1])) || a[0] - b[0] || a[1] - b[1]);
  const first = candidates.find(cell => !occupied.has(`${cell[0]},${cell[1]}`));

  if (!first) throw new Error('The finite reference enumeration must contain a free replacement in these small toy positions.');

  return first;
}

function verifyClaimAlgebra(claim: Claim): void {
  if (claim.kind === 'base') {
    expect(independentWin(claim.P)).toBe(true);
    const expected = claim.P.flatMap(cell => cell[0] === claim.missing[0] && cell[1] === claim.missing[1] ? [] : [cell]);
    expect(keys(claim.A)).toEqual(keys(expected));
    expect(keys(claim.T)).toEqual(keys(claim.P));

    return;
  }

  const unionA = new Set<string>();
  const unionT = new Set<string>(keys([claim.p]));
  const childEnvelopes = claim.children.map(child => new Set(keys(child.T)));
  const first = childEnvelopes[0];

  if (!first) throw new Error('The rule needs at least one child.');

  for (const child of claim.children) {
    verifyClaimAlgebra(child);
    for (const key of keys(child.A)) unionA.add(key);
    for (const key of keys(child.T)) unionT.add(key);
  }

  for (const key of first) {
    if (childEnvelopes.every(envelope => envelope.has(key))) unionA.add(key);
  }

  unionA.delete(`${claim.p[0]},${claim.p[1]}`);
  expect(keys(claim.A)).toEqual([...unionA].sort());
  expect(keys(claim.T)).toEqual([...unionT].sort());
  expect(claim.h).toBe(1 + Math.max(...claim.children.map(child => child.h)));
  const afterPivot = new Set([...keys(claim.A), ...keys([claim.p])]);

  for (const child of claim.children) expect(keys(child.A).every(key => afterPivot.has(key))).toBe(true);

  for (const key of unionT) {
    if (!afterPivot.has(key)) expect(childEnvelopes.some(envelope => !envelope.has(key))).toBe(true);
  }
}

function verifyLegalTrace(claim: Claim, replay: Replay): void {
  const maker = new Set(keys(replay.initialMaker));
  const breaker = new Set(keys(replay.initialBreaker));
  let makerClaims = 0;
  let breakerClaims = 0;
  let next: 'maker' | 'breaker' = 'maker';

  if (independentWin(replay.initialMaker)) expect(replay.turns.length).toBe(0);

  for (const [index, turn] of replay.turns.entries()) {
    const key = `${turn.cell[0]},${turn.cell[1]}`;
    expect(turn.player).toBe(next);
    expect(maker.has(key) || breaker.has(key)).toBe(false);

    if (turn.player === 'maker') {
      maker.add(key);
      makerClaims++;
      next = 'breaker';
      expect(turn.boundAfter).toBe(turn.boundBefore - 1);

      if (independentWin(turn.maker)) {
        expect(index).toBe(replay.turns.length - 1);
        expect(turn.completed).not.toBeNull();
      }
    } else {
      breaker.add(key);
      breakerClaims++;
      next = 'maker';
      expect(turn.childId).not.toBeNull();
    }

    expect(keys(turn.maker)).toEqual([...maker].sort());
    expect(keys(turn.breaker)).toEqual([...breaker].sort());
    expect(keys(turn.maker).some(cell => breaker.has(cell))).toBe(false);
  }

  expect(replay.makerMoves).toBe(makerClaims);
  expect(replay.breakerMoves).toBe(breakerClaims);
  expect(makerClaims).toBeLessThanOrEqual(claim.h);
  expect(independentWin(replay.completed)).toBe(true);
  expect(keys(replay.completed).every(key => maker.has(key))).toBe(true);
}

test('187: the eight allowed images and transported toy trees satisfy the independent set rule', () => {
  const model = buildTwoForksModel();
  const expected = new Set(independentOrientations().map(cells => keys(normalizedCells(cells)).join(';')));
  expect(new Set(model.orientations.map(cells => keys(cells).join(';')))).toEqual(expected);
  expect(expected.size).toBe(8);
  verifyClaimAlgebra(model.height2);
  verifyClaimAlgebra(model.height3);
  const transform = model.secondHeight2Placement;
  const origin = placeCell([0, 0], transform);
  const x = placeCell([1, 0], transform);
  const y = placeCell([0, 1], transform);
  const determinant = (x[0] - origin[0]) * (y[1] - origin[1]) - (x[1] - origin[1]) * (y[0] - origin[0]);
  expect(determinant).toBe(1);
  const transported = model.height3.children[1];

  if (!transported) throw new Error('Height three must retain its placed second height-two child.');

  expect(keys(transported.A)).toEqual(keys(model.height2.A.map(cell => placeCell(cell, transform))));
  expect(keys(transported.T)).toEqual(keys(model.height2.T.map(cell => placeCell(cell, transform))));

  for (const root of [model.height2, model.height3]) {
    const outside = root === model.height2 ? model.replyClasses.height2 : model.replyClasses.height3;
    const outsideCase = outside.find(value => value.kind === 'outside');

    if (!outsideCase) throw new Error('The toy must represent replies beyond every envelope.');

    expect(root.T.some(cell => cell[0] === outsideCase.cell[0] && cell[1] === outsideCase.cell[1])).toBe(false);
    expect(outsideCase.eligibleChildIds.length).toBe(root.children.length);
    expect(outside.every(value => value.eligibleChildIds.length > 0)).toBe(true);
  }
});

test('187: replay counts fresh claims and stops early for all toy ownership extensions and reply classes', () => {
  const model = buildTwoForksModel();

  for (const trace of Object.values(model.traces)) verifyLegalTrace(trace === model.traces.height3Inside || trace === model.traces.height3Outside || trace === model.traces.height3OtherBranch ? model.height3 : model.height2, trace);

  for (const claim of [model.height2, model.height3]) {
    const optional = claim.T.flatMap(cell => keys(claim.A).includes(`${cell[0]},${cell[1]}`) ? [] : [cell]);
    const outside: Cell[] = [[-3, -3], [-1, -1], [6, 6]];

    for (let mask = 0; mask < 2 ** optional.length; mask++) {
      const maker: Cell[] = [...claim.A];

      for (const [index, cell] of optional.entries()) {
        if ((mask & (1 << index)) !== 0) maker.push(cell);
      }

      for (let breakerMask = 0; breakerMask < 2 ** outside.length; breakerMask++) {
        const breaker: Cell[] = [];

        for (const [index, cell] of outside.entries()) {
          if ((breakerMask & (1 << index)) !== 0) breaker.push(cell);
        }

        if (independentWin(maker)) {
          const result = replayPolicy(claim, maker, breaker);
          verifyLegalTrace(claim, result);
          expect(result.makerMoves).toBe(0);

          continue;
        }

        const ownsPivot = keys(maker).includes(`${claim.p[0]},${claim.p[1]}`);
        const first = ownsPivot ? independentFirstFree(maker, breaker) : claim.p;
        const after = [...maker, first];
        const replies: Cell[] = [[20, 20], [-99, 42], [1, -50]];

        for (const cell of claim.T) {
          if (!keys(after).includes(`${cell[0]},${cell[1]}`)) replies.push(cell);
        }

        for (const reply of replies) {
          const result = replayPolicy(claim, maker, breaker, [reply, [100, 100]]);
          verifyLegalTrace(claim, result);
          const firstTurn = result.turns[0];

          if (!firstTurn) throw new Error('A nonwinning conditional position needs its fresh first Maker claim.');

          expect(firstTurn.cell).toEqual(first);
          expect(firstTurn.reason).toBe(ownsPivot ? 'replacement' : 'pivot');
          expect(result.makerMoves).toBeLessThanOrEqual(2);
          expect(result.unplayedReplies.length).toBeGreaterThan(0);
        }
      }
    }
  }

  const firstH3 = model.traces.height3Inside.turns;
  const last = firstH3[firstH3.length - 1];

  if (!last) throw new Error('The height-three toy needs its actual winning claim.');

  expect(last.reason).toBe('pivot');
  expect(model.traces.height3Inside.makerMoves).toBe(2);
  expect(model.audits.height3.maximumMakerMoves).toBe(2);
  expect(model.height3.h).toBeGreaterThan(model.traces.height3Inside.makerMoves);
  expect(() => replayPolicy(model.height2, model.height2.A, [], [model.height2.p])).toThrow();
  expect(() => replayPolicy(model.height2, [], [])).toThrow();
  expect(completedSnaky(model.height2.A)).toBeNull();
});
