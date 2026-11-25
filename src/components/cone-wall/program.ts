import vertexSource from './plates.vert?raw';
import fragmentSource from './plates.frag?raw';

export const attributes = { alpha: true, failIfMajorPerformanceCaveat: true, antialias: false, depth: false, stencil: false };

function shader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const part = gl.createShader(type);
  if (!part) throw new Error('Cone shader unavailable');
  gl.shaderSource(part, source);
  gl.compileShader(part);
  return part;
}

export function link(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Cone program unavailable');
  const vert = shader(gl, gl.VERTEX_SHADER, vertexSource);
  const frag = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    throw new Error('Cone program could not link');
  }
  return program;
}
