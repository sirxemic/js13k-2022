import { Material } from '../core/graphics/Material.js'
import { particleTexture } from './particle.js'
import {
  attributeBrightness,
  attributeColor,
  attributePosition,
  uniformCameraPosition, uniformLife,
  uniformModel,
  uniformTextures,
  uniformView, varyingColor, varyingDistance,
  varyingPosition
} from '../core/constants.js'

export let particleMaterial

export function loadParticleMaterial () {
  particleMaterial = new Material(`/*glsl*/
in float ${varyingDistance};
in vec3 ${varyingColor};

uniform float ${uniformLife};

float fba = 10.0;
float ga = 50.0;

vec4 shader() {
  float b = min(10.0, 1.0 + ${uniformLife});
  float a = max(0.0, ${varyingDistance} < fba ? 1.0 : (ga - ${varyingDistance}) / (ga - fba));
  return texture(${uniformTextures}[0], gl_PointCoord.xy) * vec4(${varyingColor}, 1.0) * b * a;
}
`, `/*glsl*/
in float ${attributeBrightness};
in vec3 ${attributeColor};

out float ${varyingDistance};
out vec3 ${varyingColor};

void vertex() {
  ${varyingPosition} = vec3(${uniformModel} * vec4(${attributePosition}, 1.0));
  ${varyingDistance} = length(${uniformCameraPosition} - ${varyingPosition});
  ${varyingColor} = ${attributeColor} * ${attributeBrightness};
  vec4 m = ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0);
  gl_PointSize = 2000.0 / -m.z;
}
`)

  particleMaterial.setTexture(particleTexture)
}
