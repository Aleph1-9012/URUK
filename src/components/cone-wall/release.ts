import { COURSE } from './courses';
import type { FaceLayout } from './material';
import { FLOATS, BOUNDS } from './instances';
import { wordBackings } from './words';

import { attributes, link } from './program';

export function openSurface(canvas: OffscreenCanvas, lost: () => void) {
  const candidate = canvas.getContext('webgl2', attributes);
  if (!candidate) return;
  const gl = candidate;
  canvas.addEventListener('webglcontextlost', lost, { once: true });
  const textures: WebGLTexture[] = [];
  const arrays: WebGLVertexArrayObject[] = [];
  let program: WebGLProgram | undefined;
  let buffer: WebGLBuffer | null = null;
  let closed = false;

  function dispose(): void {
    if (closed) return;
    closed = true;
    canvas.removeEventListener('webglcontextlost', lost);
    for (const texture of textures) gl.deleteTexture(texture);
    for (const array of arrays) gl.deleteVertexArray(array);
    gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  try {
    program = link(gl);
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error('Cone buffer unavailable');
  } catch (cause) {
    dispose();
    throw cause;
  }
  const active = program;
  const uniform = (name: string) => gl.getUniformLocation(active, name);
  const passUniform = uniform('pass');
  const frontUniform = uniform('front');
  const boundary = uniform('boundary');
  const boundaryPx = uniform('boundaryPx');

  function upload(unit: number, name: string, image: TexImageSource, smooth: boolean): void {
    const texture = gl.createTexture();
    if (!texture) throw new Error('Cone texture unavailable');
    textures.push(texture);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, smooth ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, smooth ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (gl.getError() !== gl.NO_ERROR) throw new Error('The cone texture could not be uploaded');
    gl.uniform1i(uniform(name), unit);
  }

  function prepare(atlas: ImageBitmap, face: OffscreenCanvas, scene: FaceLayout, mesh: Float32Array) {
    if (closed || gl.isContextLost()) throw new Error('Cone context lost');
    const limit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (face.width > limit || face.height > limit) {
      throw new Error('The native-resolution wall exceeds the available texture size');
    }
    const { width, height, density } = scene;
    canvas.width = face.width;
    canvas.height = face.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const words = wordBackings(scene, face);
    const wordSheet = new OffscreenCanvas(Math.max(...words.map(w => w.image.width)), words.reduce((h, w) => h + w.image.height, 0));
    const labels = wordSheet.getContext('2d');
    if (!labels) throw new Error('Cannot paint the word sheet');
    const count = 1 + words.length;
    const data = new Float32Array(count * FLOATS);
    let index = 0;
    function append(x: number, y: number, w: number, h: number, u: number, v: number, uw: number, vh: number,
      first: number, lane: number, kind: number): void {
      data[index++] = x;
      data[index++] = y;
      data[index++] = w;
      data[index++] = h;
      data[index++] = u;
      data[index++] = v;
      data[index++] = uw;
      data[index++] = vh;
      data[index++] = first;
      data[index++] = lane;
      data[index++] = kind;
    }
    append(0, 0, width, height, 0, 0, 1, 1, 0, 0, 3);
    let sy = 0;
    for (const w of words) {
      labels.drawImage(w.image, 0, sy);
      append(w.x / density, w.y / density, w.image.width / density, w.image.height / density,
        0, sy / wordSheet.height, w.image.width / wordSheet.width, w.image.height / wordSheet.height, w.first, 1, 2);
      sy += w.image.height;
    }

    const cones = mesh.subarray(BOUNDS);
    const ahead = mesh[0]!;
    const earliestTop = mesh[2]!;
    const wordCount = words.length;
    const firstHead = 1 + wordCount;
    const headCount = cones.length / FLOATS;
    if (!Number.isInteger(headCount) || !headCount) throw new Error('Invalid cone vertices');
    const start = earliestTop - COURSE;
    const end = height + 50;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength + cones.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    gl.bufferSubData(gl.ARRAY_BUFFER, data.byteLength, cones);
    function vertices(offset: number): WebGLVertexArrayObject {
      const array = gl.createVertexArray();
      if (!array) throw new Error('Cone vertices unavailable');
      arrays.push(array);
      gl.bindVertexArray(array);
      for (let i = 0; i < 3; i++) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribDivisor(i, 1);
      }
      const base = offset * FLOATS * 4;
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, FLOATS * 4, base);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, FLOATS * 4, base + 16);
      gl.vertexAttribPointer(2, 3, gl.FLOAT, false, FLOATS * 4, base + 32);
      return array;
    }
    const wallVertices = vertices(0);
    const wordVertices = vertices(1);
    const coneVertices = vertices(firstHead);
    upload(0, 'impressions', atlas, true);
    upload(1, 'words', wordSheet, false);
    upload(2, 'face', face, false);
    gl.uniform2f(uniform('viewport'), width, height);
    gl.uniform1f(uniform('density'), density);
    gl.uniform1f(uniform('rasterHeight'), canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    function batch(pass: number, array: WebGLVertexArrayObject, count: number): void {
      gl.bindVertexArray(array);
      gl.uniform1i(passUniform, pass);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    }

    function draw(progress: number) {
      if (closed) return;
      const front = start + (end - start) * progress;
      const moving = front >= start + COURSE;
      let limit = moving ? Math.ceil((front + ahead) * density) : 0;
      for (const w of words) {
        if (front >= w.first) limit = Math.max(limit, w.y + w.image.height);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(frontUniform, front);
      gl.uniform1f(boundary, limit / density);
      gl.uniform1f(boundaryPx, limit);
      batch(0, wallVertices, 1);
      if (moving) {
        batch(1, coneVertices, headCount);
        batch(2, coneVertices, headCount);
        batch(3, coneVertices, headCount);
        batch(4, wordVertices, wordCount);
      }
    }
    return { draw };
  }

  async function readyToPresent() {
    const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!fence) return false;
    gl.flush();
    // A software GL driver may accept the context but take hundreds of milliseconds
    // to draw one pose. The 2D renderer can present the same artwork during that wait.
    const deadline = performance.now() + 40;
    try {
      while (!closed && performance.now() <= deadline) {
        const status = gl.clientWaitSync(fence, 0, 0);
        if (status === gl.CONDITION_SATISFIED || status === gl.ALREADY_SIGNALED) return true;
        if (status === gl.WAIT_FAILED) break;
        await new Promise(resolve => setTimeout(resolve, 4));
      }
      return false;
    } finally { if (!closed) gl.deleteSync(fence); }
  }

  return { prepare, dispose, readyToPresent };
}
