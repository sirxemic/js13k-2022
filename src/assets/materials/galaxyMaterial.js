import { Material } from '../../core/graphics/Material.js'
import {
  attributePosition,
  uniformColor,
  uniformFocusAmount,
  uniformKick,
  uniformModel,
  uniformProjection, uniformShowGalaxy,
  uniformSnare,
  uniformTextures,
  uniformView,
  varyingUv
} from '../../core/constants.js'

import { galaxyTexture } from '../textures/galaxy.js'

export let galaxyMaterial

const shaderFragment = `/*glsl*/
uniform float ${uniformKick};
uniform float ${uniformSnare};
uniform float ${uniformFocusAmount};
uniform float ${uniformShowGalaxy};

in vec2 ${varyingUv};

vec4 shader() {
  float g = texture(${uniformTextures}[0], ${varyingUv} * 0.5 + 0.5).r * 0.5;
  float s = 0.2 + 0.7 * (${uniformKick} + ${uniformSnare});
  float r = length(${varyingUv});
  float gc = 0.5 * exp(-2.0 * r * r) / (20.0 * r);
  return (0.5 + 0.5 * ${uniformFocusAmount}) * ${uniformColor} * vec4(vec3(g * s) + gc, 1.0) * (0.1 + 0.9 * ${uniformShowGalaxy});
}
`

const shaderVertex = `/*glsl*/
out vec2 ${varyingUv};

void main() {
  ${varyingUv} = ${attributePosition}.xy;
  gl_Position = ${uniformProjection} * ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0);
}
`

export function loadGalaxyMaterial () {
  galaxyMaterial = new Material(shaderFragment, shaderVertex)
  galaxyMaterial.setTexture(galaxyTexture)
}
