import { createTimeline } from '../../plate/timeline';

export const CUES = [
  { at: 0, title: 'A wave on a perfect grid', text: 'In a perfect crystal an electron moves freely, and the material conducts. Picture the crystal as a grid, with the electron\'s wave hopping between neighbours.', sources: [1, 19] },
  { at: 9500, title: 'Strong impurities trap the wave', text: 'Add random impurities and, Philip Anderson argued in 1958, the wave can get trapped in a small region and never leave: the material insulates.', sources: [4] },
  { at: 18000, title: 'The predicted map', text: 'Physicists predicted that in one and two dimensions any disorder traps everything, while in three, weak disorder leaves some electrons free to travel.', sources: [1, 2, 5] },
  { at: 27000, title: 'Proofs at the edges', text: 'Proofs came only at strong disorder or extreme energies, and free states only on a loopless tree. Neither prediction was proved on a grid.', sources: [1, 2, 7, 8, 9, 12] },
  { at: 35500, title: 'Two problems for the century', text: 'Barry Simon listed both in 2000 as the first two of his fifteen problems for the century. On 23 September 2026 OpenAI posted two papers claiming both.', sources: [1, 2, 6] },
  { at: 44500, title: 'Sharp energies', text: 'An eigenstate has one sharp energy and a steady probability pattern. If such states form a complete basis, the spectrum is pure point.', sources: [1, 2] },
  { at: 52500, title: 'An absolutely continuous band', text: 'The free infinite grid instead has absolutely continuous spectrum, with energy spread continuously across a band.', sources: [1, 2] },
  { at: 59500, title: 'Every positive disorder in two dimensions', text: 'The 2D paper claims that at every disorder strength, however weak, the spectrum is pure point at every energy.', sources: [2] },
  { at: 66000, title: 'A small spreading interval in three dimensions', text: 'The other claims that in three dimensions and up, at weak enough disorder, a small energy interval near the bottom of the band carries only spreading states.', sources: [1] },
  { at: 75500, title: 'Two spectral types in one operator', text: 'Nearer the bottom of the spectrum a known theorem gives trapped states, so the two kinds coexist. The mobility edge between them stays open.', sources: [1, 15] },
  { at: 84000, title: 'Watching the resolvent', text: 'The 3D proof watches the resolvent: if its diagonal keeps a positive imaginary part as a small damping $\\eta$ shrinks to zero, the states spread.', sources: [1] },
  { at: 92500, title: 'Certifying one binary digit at a time', text: 'It certifies this on a large periodic box, revealing each site\'s random value one binary digit at a time and rolling back trials that fail.', sources: [1] },
  { at: 101000, title: 'The plane makes separation cheap', text: 'The 2D proof reads trapping off a scattering problem. Its decisive step uses the plane: a logarithmic profile separates the inside from a far ring at almost no cost.', sources: [2] },
  { at: 111000, title: 'Where it stands', text: 'Under review: Jaksic and Last have worked through the last step of the 3D proof, with no verdict. We found no named expert discussing the 2D paper.', sources: [11] },
] as const;

export const FILM_DURATION = 120000;

export const TIMELINE = createTimeline(CUES, FILM_DURATION, 200);
