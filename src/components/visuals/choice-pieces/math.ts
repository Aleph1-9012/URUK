export type ChoiceTargets = readonly [number, number, number];

export type ChoiceAssignment = {
  to: ChoiceTargets;
  inside: readonly [boolean, boolean, boolean];
  allInside: boolean;
};

/** The finite picture supplies no model of set theory or infinite-set claim. */
export function buildChoicePiecesModel() {
  const points = 6;
  const pieces = [[0], [1, 2], [3, 4, 5]] as const;
  const assignments: ChoiceAssignment[] = [];
  const insideIndices: number[] = [];
  const insideChoices: ChoiceTargets[] = [];
  const histogram: [number, number, number, number] = [0, 0, 0, 0];

  for (let first = 0; first < points; first++) {
    for (let second = 0; second < points; second++) {
      if (second === first) continue;

      for (let third = 0; third < points; third++) {
        if (third === first || third === second) continue;

        const to: ChoiceTargets = [first, second, third];
        const inside = [
          pieces[0].some(point => point === first),
          pieces[1].some(point => point === second),
          pieces[2].some(point => point === third),
        ] as const;
        const allInside = inside.every(value => value);
        const insideCount = inside.reduce((sum, value) => sum + Number(value), 0);
        const previousCount = histogram[insideCount];

        if (previousCount === undefined) throw new Error('Each three-piece assignment has between zero and three inside picks.');

        histogram[insideCount] = previousCount + 1;

        if (allInside) {
          insideIndices.push(assignments.length);
          insideChoices.push(to);
        }

        assignments.push({ to, inside, allInside });
      }
    }
  }

  return {
    points,
    pieces,
    assignments,
    insideIndices,
    insideChoices,
    exampleOutside: [4, 0, 1] as const,
    histogram,
    counts: { injections: assignments.length, inside: insideIndices.length, outside: assignments.length - insideIndices.length },
  };
}

export type ChoicePiecesModel = ReturnType<typeof buildChoicePiecesModel>;
