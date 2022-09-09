import { Material } from '../core/graphics/Material.js'
import {
  uniformCameraPosition,
  uniformHeadPosition,
  uniformKick,
  uniformSnare,
  uniformTextures,
  uniformTime,
  varyingPosition
} from '../core/constants.js'
import { noiseTexture } from './noise.js'

export let skyboxMaterial

export function loadSkyboxMaterial () {
  /**
   * Based on https://www.shadertoy.com/view/stBcW1
   */
  skyboxMaterial = new Material(`/*glsl*/
  uniform vec3 ${uniformCameraPosition};
  uniform float ${uniformKick};
  uniform float ${uniformSnare};
  uniform float ${uniformTime};

#define LAYERS            4.0

#define PI                3.141592654

float tanh_approx(float x) {
  float x2 = x*x;
  return clamp(x*(27.0 + x2)/(27.0+9.0*x2), -1.0, 1.0);
}

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

vec3 blackbody(float Temp) {
  vec3 col = vec3(255.);
  col.x = 56100000. * pow(Temp,(-3. / 2.)) + 148.;
  col.y = 100.04 * log(Temp) - 623.6;
  if (Temp > 6500.) col.y = 35200000. * pow(Temp,(-3. / 2.)) + 184.;
  col.z = 194.18 * log(Temp) - 1448.6;
  col = clamp(col, 0., 255.)/255.;
  if (Temp < 1000.) col *= Temp/1000.;
  return col;
}

float noise(vec2 p) {
  return texture(${uniformTextures}[0], 0.002 * p).x;
}

vec3 stars(vec3 rd, vec2 sp, float hh) {
  vec3 col = vec3(0.0);

  float m = LAYERS;
  hh = tanh_approx(20.0*hh);

  for (float i = 0.0; i < m; ++i) {
    vec2 pp = sp+0.5*i;
    float s = i/(m-1.0);
    vec2 dim  = vec2(mix(0.05, 0.003, s)*PI);
    vec2 np = mod2(pp, dim);
    vec2 h = hash2(np+127.0+i);
    vec2 o = -1.0+2.0*h;
    float y = sin(sp.x);
    pp += o*dim*0.5;
    pp.y *= y;
    float l = length(pp);

    float h1 = fract(h.x*1667.0);
    float h2 = fract(h.x*1887.0);
    float h3 = fract(h.x*2997.0);

    vec3 scol = mix(8.0*h2, 0.25*h2*h2, s)*blackbody(mix(3000.0, 22000.0, h1*h1));

    vec3 ccol = col + exp(-(mix(6000.0, 2000.0, hh)/mix(2.0, 0.25, s))*max(l-0.001, 0.0))*scol;
    col = h3 < y ? ccol : col;
  }

  return col;
}

vec3 color(vec3 rd, vec3 lp, vec4 md) {
  vec2 sp = toSpherical(rd.xzy).yz;

  float sf = 0.0;
  float cf = 0.0;
  vec3 col = vec3(0.0);

  col += stars(rd, sp, sf) * (1.0 - tanh_approx(2.0*cf)) * (0.1 + ${uniformKick});

  return col;
}

vec4 shader() {
  vec3 lp = vec3(1.0, 0.0, 0.0);
  vec4 md = 50.0*vec4(vec3(1.0, 1., -0.6), 0.5);

  vec3 rd = normalize(${varyingPosition} - ${uniformCameraPosition});
  vec3 col = color(rd, lp, md);

  return vec4(col, 1.0);
}
`)
  skyboxMaterial.setTexture(noiseTexture)
}
