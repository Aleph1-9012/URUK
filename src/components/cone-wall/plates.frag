#version 300 es
precision highp float;
precision highp int;
uniform sampler2D impressions, words, face;
uniform float boundaryPx, rasterHeight;
uniform int pass;
in vec2 uv, corner;
flat in int material;
out vec4 color;
void main() {
  float row = rasterHeight - gl_FragCoord.y;
  if ((pass == 0 && row < boundaryPx) || ((pass == 1 || pass == 2) && row >= boundaryPx)) discard;
  if (material == 0) {
    float d = length(2.0 * corner - 1.0);
    float coverage = clamp((1.0 - d) / max(fwidth(d), 0.00001) + 0.5, 0.0, 1.0);
    color = vec4(vec3(231.0,229.0,224.0)/255.0,1.0) * coverage;
  } else if (material == 1) {
    color = texture(impressions, uv);
  } else if (material == 2) {
    color = texture(words, uv);
  } else {
    color = texture(face, uv);
  }
}
