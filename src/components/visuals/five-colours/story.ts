// Claude's approved 158 storyboard, revised 8 November 2026. Times are milliseconds.
export const CUES = [
  { at: 0, title: 'One unit apart', text: 'Colour every point of a sheet, with one rule: two points exactly one unit apart must never share a colour. How few colours will do?', sources: [1] },
  { at: 9000, title: 'A triangle needs three', text: 'Two colours fail at once: an equilateral triangle of side one needs three.', sources: [1] },
  { at: 15000, title: 'Building the Moser spindle', text: 'Three fail because of the Moser spindle: two rhombuses of unit triangles, hinged at one point and turned until their far tips are one unit apart.', sources: [1, 18] },
  { at: 25500, title: 'The forced clash', text: 'Any three-colouring forces the two far tips to share a colour, yet they are one unit apart. So four colours are needed: Nelson\'s lower bound.', sources: [1, 18] },
  { at: 34000, title: 'Seven colours suffice', text: 'Seven suffice: tile the plane with hexagons of circumradius $\\tfrac25$ in a repeating pattern of seven, so same-coloured hexagons are more than one unit apart.', sources: [1, 18] },
  { at: 44500, title: 'The step to five', text: 'For sixty-eight years the answer stayed four, five, six or seven. In 2018 Aubrey de Grey found 1,581 points that four colours cannot colour.', sources: [1, 3, 4] },
  { at: 53500, title: 'The claimed step to six', text: 'On 23 September 2026 OpenAI posted a paper claiming that five colours are not enough either. If it holds, the answer is six or seven.', sources: [1] },
  { at: 61500, title: 'From a wild colouring to a tame one', text: 'Earlier bounds used finite patterns, newer ones checked by computer. This paper builds none: even a wild five-colouring could be made tame.', sources: [1] },
  { at: 70500, title: 'What tame means', text: 'Tame means each colour has an area and same-coloured unit pairs are negligible. The paper then argues that no tame five-colouring exists.', sources: [1] },
  { at: 79000, title: 'Averaging over the plane', text: 'To tame a colouring, keep the points with algebraic coordinates and average the colours over shifts and rotations of the plane.', sources: [1] },
  { at: 87500, title: 'Waves and a uniform remainder', text: 'The result splits into smooth waves and a wild remainder. The paper\'s rigidity theorem says the remainder is uniform, so it can be dropped.', sources: [1] },
  { at: 96000, title: 'A loop of colour changes', text: 'Step two looks closely at single points. Almost every direction there sees at most two colours, and at some point the colour changes must form a loop.', sources: [1] },
  { at: 105500, title: 'The spindle returns', text: 'The loop has three, four or five colours. Four and five are ruled out. Three leaves a three-colour region, and a Moser spindle, which needs four, fits inside.', sources: [1] },
  { at: 115000, title: 'Where it stands', text: 'Under review: the Polymath16 group that shrank de Grey\'s graph is reading the paper in public, and nobody has said the proof is correct.', sources: [9] },
] as const;

export const FILM_DURATION = 120000;

export function cueAt(time: number): number {
  let index = 0;

  for (const [position, cue] of CUES.entries()) {
    if (time >= cue.at) index = position;
  }

  return index;
}

export function cueEnd(index: number): number {
  return CUES[index + 1]?.at ?? FILM_DURATION;
}

export function stillTime(index: number): number {
  return index === CUES.length - 1 ? FILM_DURATION : cueEnd(index) - 200;
}

export function formatTime(time: number): string {
  const seconds = Math.floor(Math.max(0, Math.min(FILM_DURATION, time)) / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function smooth(time: number, start: number, end: number): number {
  const amount = Math.min(1, Math.max(0, (time - start) / (end - start)));

  return amount * amount * (3 - 2 * amount);
}

// Reserved for emphasis within a drawing, not for dissolving between scenes or changing tags.
export function fade(time: number, start: number, end: number, outStart = Infinity, outEnd = Infinity): number {
  return smooth(time, start, end) * (outStart === Infinity ? 1 : 1 - smooth(time, outStart, outEnd));
}
