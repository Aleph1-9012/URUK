export type StairVertex = { position: number; depth: number };

/** These are drawing coordinates only: no Hamiltonian, atom or energy data. */
export function buildExcessStairsModel() {
  const positions = [0, .16, .32, .48, .64, .80, 1] as const;
  const depthProfiles = [
    [0, .26, .49, .65, .76, .86, .86],
    [0, .38, .55, .55, .72, .90, .90],
    [0, .20, .44, .62, .62, .83, .83],
    [0, .32, .48, .60, .79, .93, .93],
  ] as const;
  const wallReadouts = Array.from({ length: 4 }, (_, index) => {
    const Z = index + 1;
    const wall = 2 * Z + 1;

    // N_c is an integer. The strict inequality N_c < 2Z+1 gives 2Z
    // only for these integer Z examples, not for an arbitrary real charge.
    return { Z, wall, maxBoundInteger: wall - 1, roomForExtra: wall - 1 - Z };
  });

  return { kind: 'schematic' as const, positions, depthProfiles, flatFrom: positions[5], wallReadouts };
}

export type ExcessStairsModel = ReturnType<typeof buildExcessStairsModel>;

/** Convex interpolation preserves downward steps and the common flat tail. */
export function schematicStairAt(model: ExcessStairsModel, phase: number) {
  if (!Number.isFinite(phase) || phase < 0 || phase > 1) throw new RangeError('The schematic morph phase must lie between zero and one.');

  const clock = phase * (model.depthProfiles.length - 1);
  const index = Math.floor(clock);
  const from = model.depthProfiles[index];
  const to = model.depthProfiles[Math.min(index + 1, model.depthProfiles.length - 1)];

  if (!from || !to) throw new Error('Each schematic morph needs its two illustrative profiles.');

  const fraction = clock - index;
  const depths = from.map((depth, at) => {
    const next = to[at];

    if (next === undefined) throw new Error('The graphic profiles must use the same horizontal knots.');

    return depth + fraction * (next - depth);
  });
  const firstPosition = model.positions[0];
  const firstDepth = depths[0];

  if (firstDepth === undefined) throw new Error('The schematic stair needs its initial graphic depth.');

  const vertices: StairVertex[] = [{ position: firstPosition, depth: firstDepth }];

  for (let at = 1; at < model.positions.length; at++) {
    const position = model.positions[at];
    const previousDepth = depths[at - 1];
    const depth = depths[at];

    if (position === undefined || previousDepth === undefined || depth === undefined) throw new Error('Each drawn step needs its horizontal knot and both graphic depths.');

    vertices.push({ position, depth: previousDepth });

    if (depth !== previousDepth) vertices.push({ position, depth });
  }

  return { vertices, tailStart: model.flatFrom, illustrative: true as const };
}
