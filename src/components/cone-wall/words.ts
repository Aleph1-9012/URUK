import { PAPER, type FaceLayout } from './material';
import { courseEdge, COURSE } from './courses';

interface Word { x: number; y: number; first: number; image: OffscreenCanvas }

/** Take the words from the approved closed raster so that the typography and its subpixel positions agree exactly. */
export function wordBackings(scene: FaceLayout, face: OffscreenCanvas): Word[] {
  const words: Word[] = [];
  const { density, fontSize, baseline } = scene;
  let start = 0;
  for (let i = 0; i <= scene.letters.length; i++) {
    const next = scene.letters[i];
    if (next && next.value !== ' ') continue;
    const first = scene.letters[start];
    const last = scene.letters[i - 1];
    start = i + 1;
    if (!first || !last) continue;

    const left = Math.floor((first.x - 3) * density);
    const right = Math.ceil((last.x + last.width + 3) * density);
    const top = Math.floor((scene.centre - fontSize * 0.62) * density);
    const bottom = Math.ceil((scene.centre + fontSize * 0.62) * density);
    const pad = Math.ceil(7 * density);
    const x = left - pad;
    const y = top - pad;
    const image = new OffscreenCanvas(right - left + 2 * pad, bottom - top + 2 * pad);
    const brush = image.getContext('2d');
    if (!brush) throw new Error('Cannot paint the name');
    brush.save();
    brush.setTransform(density, 0, 0, density, -x, -y);
    brush.fillStyle = PAPER;
    brush.beginPath();
    // The word is on a single irregular piece of plaster, supported by overlapping round heads.
    const wordLeft = first.x;
    const wordRight = last.x + last.width;
    for (let row = -1; row <= 1; row++) {
      const cy = baseline - 0.32 * fontSize + row * fontSize * 0.30;
      for (let cx = wordLeft + 3; cx < wordRight + 7; cx += 8) {
        const centre = Math.min(cx + (row & 1) * 2, wordRight - 1);
        const radius = Math.max(7.5, fontSize * 0.28);
        brush.moveTo(centre + radius, cy);
        brush.arc(centre, cy, radius, 0, 2 * Math.PI);
      }
    }
    brush.fill();
    brush.restore();
    // Sample the complete word inside the rounded surround; only the physical plaster has alpha.
    brush.globalCompositeOperation = 'source-in';
    brush.drawImage(face, x, y, image.width, image.height, 0, 0, image.width, image.height);
    let earliest = Infinity;
    for (let cx = first.x; cx <= wordRight + 2; cx += 4) earliest = Math.min(earliest, y / density - courseEdge(cx, scene.seed));
    // Let the wide word leave on the beat before its first supporting clump.
    words.push({ x, y, first: (Math.floor(earliest / COURSE) - 1) * COURSE, image });
  }
  return words;
}
