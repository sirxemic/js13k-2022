import { Material } from '../core/graphics/Material.js'
import { particleTexture } from './particle.js'
import {
  attributeColor,
  attributeParticleProperties,
  attributePosition,
  uniformHeadPosition,
  uniformFocusPosition,
  uniformKick,
  uniformModel,
  uniformProjection,
  uniformSnare,
  uniformTextures,
  uniformView,
  varyingColor,
  varyingDistance,
  varyingPosition
} from '../core/constants.js'
import { SCALE, VIEW_DISTANCE } from '../constants.js'

export let particleMaterial

export function loadParticleMaterial () {
  particleMaterial = new Material(`/*glsl*/
in float ${varyingDistance};
in vec3 ${varyingColor};

uniform float ${uniformKick};

float fba = ${VIEW_DISTANCE * 0.75};
float ga = ${VIEW_DISTANCE}.0;

vec4 shader() {
  float b = 1.0 + ${uniformKick};
  float a = clamp((ga - ${varyingDistance}) / (ga - fba), 0.0, 1.0);
  return texture(${uniformTextures}[0], gl_PointCoord.xy) * vec4(${varyingColor}, 1.0) * b * a;
}
`, `/*glsl*/
layout(location = 1) in vec2 ${attributeParticleProperties};
layout(location = 2) in vec3 ${attributeColor};

uniform vec3 ${uniformFocusPosition};
uniform float ${uniformKick};
uniform float ${uniformSnare};

out float ${varyingDistance};
out vec3 ${varyingColor};

void main() {
  ${varyingPosition} = vec3(${uniformModel} * vec4(${attributePosition}, 1.0));
  gl_Position = ${uniformProjection} * ${uniformView} * vec4(${varyingPosition}, 1.0);
  ${varyingDistance} = max(length(${uniformHeadPosition} - ${varyingPosition}), length(${uniformFocusPosition} - ${varyingPosition}));
  ${varyingColor} = min(vec3(${attributeParticleProperties}.x), ${attributeColor} * 5.0);
  vec4 m = ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0);
  gl_PointSize = (1.0 + mix(${uniformKick}, ${uniformSnare}, ${attributeParticleProperties}.y)) * ${2000 * SCALE}.0 / -m.z;
}
`)

  particleMaterial.setTexture(particleTexture)
}
