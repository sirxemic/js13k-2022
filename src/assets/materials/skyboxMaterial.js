import { Material } from '../../core/graphics/Material.js'
import {
  uniformCameraPosition, uniformChannelCount, uniformFocusAmount,
  uniformHeadPosition,
  uniformKick,
  uniformSnare,
  uniformTextures,
  uniformTime,
  varyingPosition
} from '../../core/constants.js'
import { noiseTexture } from '../textures/noise.js'

export let skyboxMaterial

export function loadSkyboxMaterial () {
  /**
   * Based on https://www.shadertoy.com/view/stBcW1
   */
  skyboxMaterial = new Material(`/*glsl*/
  uniform vec3 ${uniformCameraPosition};
  uniform float ${uniformKick};
  uniform float ${uniformSnare};
  uniform float ${uniformFocusAmount};
  uniform float ${uniformChannelCount};

#define LAYERS            4.0

#define PI                3.141592654

vec2 mod2(inout vec2 p, vec2 size) {
  vec2 c = floor((p + size*0.5)/size);
  p = mod(p + size*0.5,size) - size*0.5;
  return c;
}

vec2 hash2(vec2 p) {
  return texture(${uniformTextures}[0], 0.001 * p).xy;
}

vec3 toSpherical(vec3 p) {
  float r   = length(p);
  float t   = acos(p.z/r);
  float ph  = atan(p.y, p.x);
  return vec3(r, t, ph);
}

float noise(vec2 p) {
  return texture(${uniformTextures}[0], 0.002 * p).x;
}

float tanh_approx(float x) {
  //  Found this somewhere on the interwebs
  //  return tanh(x);
  float x2 = x*x;
  return clamp(x*(27.0 + x2)/(27.0+9.0*x2), -1.0, 1.0);
}

const vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
  return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
}

vec3 stars(vec3 rd, vec2 sp) {
  vec3 col = vec3(0.0);

  float m = LAYERS;

  for (float i = 0.0; i < m; ++i) {
    vec2 pp = sp+0.5*i;
    float s = i / (m - 1.0);
    vec2 dim  = vec2(mix(0.05, 0.003, s)*PI);
    vec2 np = mod2(pp, dim);
    vec2 h = hash2(np+127.0+i);
    vec2 o = -1.0+2.0*h;
    float y = sin(sp.x);
    pp += o * dim * 0.5;
    pp.y *= y;
    float l = length(pp);

    float h2 = fract(h.x*1887.0);
    float h3 = fract(h.x*2997.0);

    col = h3 < y
      ? col + exp(-6000.0 * max(l - 0.001, 0.0)) * mix(8.0 * h2, 0.25 * h2 * h2, s)
      : col;
  }

  return col;
}

vec3 sky(vec3 rd, vec2 sp) {
  float y = -0.5 + sp.x / PI;
  y = abs(y) + 0.1 * smoothstep(0.5, PI, abs(sp.y));
  return hsv2rgb(vec3(0.6, 0.75, 0.35 * exp(-15.0*y)));
}

vec3 color(vec3 rd, vec3 lp, vec4 md) {
  vec2 sp = toSpherical(rd.xzy).yz;

  float sf = 0.0;
  float cf = 0.0;
  vec3 col = vec3(0.0);

  col += sky(rd, sp) * min(1.0, ${uniformFocusAmount}) * min(1.0, ${uniformChannelCount});
  col += stars(rd, sp) * (0.1 + ${uniformSnare});

  return col;
}

vec4 shader() {
  vec3 lp = vec3(0.0, 0.5, -1.0);
  vec4 md = 50.0*vec4(vec3(1.0, 1., -0.6), 0.5);

  vec3 rd = normalize(${varyingPosition} - ${uniformCameraPosition});
  vec3 col = color(rd, lp, md);

  return vec4(col, 1.0);
}
`)
  skyboxMaterial.setTexture(noiseTexture)
}
