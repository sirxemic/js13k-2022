import { Material } from '../../core/graphics/Material.js'
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
  uniformView,
  varyingColor,
  varyingDistance,
  varyingPosition
} from '../../core/constants.js'
import { SCALE, VIEW_DISTANCE } from '../../constants.js'

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
  float r = 2.0 * length(gl_PointCoord.xy - 0.5);
  return exp(-5.0 * r * r) * (r < 0.05 ? 1.0 : 0.05 / r) * vec4(${varyingColor}, 1.0) * b * a;
}
`, `/*glsl*/
layout(location = 1) in float ${attributeParticleProperties};
layout(location = 2) in vec3 ${attributeColor};

uniform vec3 ${uniformFocusPosition};
uniform float ${uniformKick};

out float ${varyingDistance};
out vec3 ${varyingColor};

void main() {
  ${varyingPosition} = ${attributePosition};
  vec4 m = ${uniformView} * vec4(${attributePosition}, 1.0);
  gl_Position = ${uniformProjection} * m;
  float a = clamp((m.z + 10.0) / -10.0, 0.0, 1.0);
  gl_PointSize = (1.0 + ${uniformKick}) * ${2000 * SCALE}.0 / -m.z;
  ${varyingDistance} = max(length(${uniformHeadPosition} - ${varyingPosition}), length(${uniformFocusPosition} - ${varyingPosition}));
  ${varyingColor} = a * min(vec3(${attributeParticleProperties}), ${attributeColor} * 5.0);
}
`)
}
