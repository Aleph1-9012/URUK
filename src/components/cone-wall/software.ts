import { BOUNDS, FLOATS } from './instances';
import { COURSE } from './courses';
import { PAPER, type FaceLayout } from './material';
import { wordBackings } from './words';

/** Draw the same plate rectangles, clumps and gravity curve as the WebGL release. */
export function softwareRelease(output: OffscreenCanvas, face: OffscreenCanvas, atlas: ImageBitmap, scene: FaceLayout, mesh: Float32Array) {
  output.width = face.width;
  output.height = face.height;
  const brush = output.getContext('2d');
  if (!brush) throw new Error('Cannot display cone artwork');
  const ctx = brush;
  const { width, height, density } = scene;
  const words = wordBackings(scene, face);
  const start = mesh[2]! - COURSE;
  const travel = height + 50 - start;

  function drop(distance: number, lane: number) {
    return Math.floor(.5 + density * (36 + distance * (1.45 + .32 * lane + (2.1 + .55 * lane) * distance / height))) / density;
  }

  function cone(i: number, offset: number) {
    const x = mesh[i]!, y = mesh[i+1]! + offset, w = mesh[i+2]!, h = mesh[i+3]!;
    if (y >= height || y + h <= 0) return;
    if (mesh[i+10] === 0) {
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2);
      ctx.fill();
    } else {
      ctx.drawImage(atlas, Math.round(mesh[i+4]!*atlas.width), Math.round(mesh[i+5]!*atlas.height),
        Math.round(mesh[i+6]!*atlas.width), Math.round(mesh[i+7]!*atlas.height), x,y,w,h);
    }
  }

  return (progress: number) => {
    ctx.resetTransform();
    ctx.clearRect(0, 0, output.width, output.height);
    const front = start + travel * progress;
    if (front < start + COURSE) { ctx.drawImage(face, 0, 0); return; }
    let cut = Math.max(0, Math.min(output.height, Math.ceil((front + mesh[0]!) * density)));
    for (const word of words) {
      if (front >= word.first) cut = Math.max(cut, word.y + word.image.height);
    }
    if (cut < face.height) ctx.drawImage(face, 0,cut,face.width,face.height-cut, 0,cut,face.width,face.height-cut);
    ctx.setTransform(density,0,0,density,0,0);
    ctx.fillStyle = PAPER;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0,0,width,cut/density);
    ctx.clip();
    for (const kind of [0,1]) {
      for (let i=BOUNDS; i<mesh.length; i+=FLOATS) {
        if (mesh[i+10] === kind && mesh[i+8]! > front && mesh[i+1]! < cut/density) cone(i,0);
      }
    }
    ctx.restore();
    for (let i=BOUNDS; i<mesh.length; i+=FLOATS) {
      const distance = front - mesh[i+8]!;
      if (distance >= 0) cone(i,drop(distance,mesh[i+9]!));
    }
    ctx.resetTransform();
    for (const word of words) {
      const distance = front - word.first;
      if (distance >= 0) {
        ctx.drawImage(word.image, word.x, word.y + Math.round(drop(distance, 1) * density));
      } else {
        const rows = Math.min(word.image.height, cut - word.y);
        if (rows > 0) {
          ctx.drawImage(word.image, 0, 0, word.image.width, rows, word.x, word.y, word.image.width, rows);
        }
      }
    }
  };
}
