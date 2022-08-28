import { Material } from '../core/graphics/Material.js'
import { uniformCameraPosition, uniformLife, uniformTextures, uniformTime, varyingPosition } from '../core/constants.js'
import { noiseTexture } from './noise.js'

export let skyboxMaterial

export function loadSkyboxMaterial () {
  /**
   * Based on https://www.shadertoy.com/view/stBcW1
   */
  skyboxMaterial = new Material(`/*glsl*/
  uniform vec3 ${uniformCameraPosition};
  uniform float ${uniformLife};
  uniform float ${uniformTime};

#define LAYERS            4.0

#define PI                3.141592654
#define TAU               6.283185307
#define RESOLUTION        vec2(1000.0, 1000.0)
#define ROT(a)            mat2(cos(a), sin(a), -sin(a), cos(a))

float tanh_approx(float x) {
  float x2 = x*x;
  return clamp(x*(27.0 + x2)/(27.0+9.0*x2), -1.0, 1.0);
}

vec4 hsv2rgb_K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6.0 - hsv2rgb_K.www);
  return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, 0.0, 1.0), c.y);
}

vec2 mod2(inout vec2 p, vec2 size) {
  vec2 c = floor((p + size*0.5)/size);
  p = mod(p + size*0.5,size) - size*0.5;
  return c;
}

vec2 hash2(vec2 p) {
  return texture(${uniformTextures}[0], 0.001 * p).xy;
}

vec2 shash2(vec2 p) {
  return -1.0+2.0*hash2(p);
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

float fbm(vec2 p, float o, float s, int iters) {
  p *= s;
  p += o;

  mat2 pp = 2.04*ROT(1.0);

  float h = 0.0;
  float a = 1.0;
  float d = 0.0;
  for (int i = 0; i < iters; ++i) {
    d += a;
    h += a*noise(p);
    p += vec2(10.7, 8.3);
    p *= pp;
    a *= 0.5;
  }
  h /= d;

  return h;
}

float height(vec2 p) {
  float h = fbm(p, 0.0, 5.0, 5);
  h *= 0.3;
  h += 0.0;
  return (h);
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

vec3 sky(vec3 rd, vec2 sp, vec3 lp, out float cf) {
  float ld = max(dot(normalize(lp), rd),0.0);
  float y = -0.5+sp.x/PI;
  y = max(abs(y)-0.02, 0.0)+0.1*smoothstep(0.5, PI, abs(sp.y));
  vec3 blue = hsv2rgb(vec3(0.6, 0.75, 0.35*exp(-15.0*y)));
  float ci = pow(ld, 10.0)*2.0*exp(-25.0*y);
  vec3 yellow = blackbody(1500.0)*ci;
  cf = ci;
  return blue+yellow;
}

vec3 galaxy(vec3 rd, vec2 sp, out float sf) {
  vec2 gp = sp;
  gp *= ROT(0.67);
  gp += vec2(-1.0, 0.5);
  float h1 = height(2.0*sp);
  float gcc = dot(gp, gp);
  float gcx = exp(-(abs(3.0*(gp.x))));
  float gcy = exp(-abs(10.0*(gp.y)));
  float gh = gcy*gcx;
  float cf = smoothstep(0.05, -0.2, -h1);
  vec3 col = vec3(0.0);
  col += blackbody(mix(300.0, 1500.0, gcx*gcy))*gcy*gcx;
  col += hsv2rgb(vec3(0.6, 0.5, 0.00125/gcc));
  col *= mix(mix(0.15, 1.0, gcy*gcx), 1.0, cf);
  sf = gh*cf;
  return col;
}

vec3 color(vec3 rd, vec3 lp, vec4 md) {
  vec2 sp = toSpherical(rd.xzy).yz;

  float sf = 0.0;
  float cf = 0.0;
  vec3 col = vec3(0.0);

  col += stars(rd, sp, sf) * (1.0 - tanh_approx(2.0*cf)) * ${uniformLife};
  col += galaxy(rd, sp, sf) * ${uniformLife};
  col += sky(rd, sp, lp, cf) * ${uniformLife};

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
