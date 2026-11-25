#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec4 rect;
layout(location=1) in vec4 printRect;
layout(location=2) in vec3 motion;
uniform vec2 viewport;
uniform float density, front, boundary;
uniform int pass;
out vec2 uv, corner;
flat out int material;
void main() {
  corner = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  material = int(motion.z);
  uv = printRect.xy + corner * printRect.zw;
  float distance = front - motion.x;
  bool fixedPaper = pass == 1 && material == 0 && distance < 0.0;
  bool fixedInk = pass == 2 && material == 1 && distance < 0.0;
  bool falling = pass == 3 && material < 2 && distance >= 0.0;
  bool word = pass == 4 && material == 2;
  bool face = pass == 0 && material == 3;
  if (!(fixedPaper || fixedInk || falling || word || face) || ((fixedPaper || fixedInk) && rect.y > boundary)) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    return;
  }
  float y = 0.0;
  if (falling || (word && distance >= 0.0)) {
    float lane = motion.y;
    y = floor(0.5 + density * (36.0 + distance * (1.45 + 0.32 * lane + (2.1 + 0.55 * lane) * distance / viewport.y))) / density;
  }
  vec2 pos = rect.xy + corner * rect.zw + vec2(0.0, y);
  gl_Position = vec4(pos / viewport * vec2(2.0,-2.0) + vec2(-1.0,1.0), 0.0, 1.0);
}
