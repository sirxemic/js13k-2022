import { Material } from '../../core/graphics/Material.js'
import {
  attributePosition,
  varyingUv,
  uniformModel,
  uniformProjection,
  uniformView,
  uniformFocusPosition,
  uniformEndSizeInverse
} from '../../core/constants.js'

export let goalMaterial

export function loadGoalMaterial () {
  goalMaterial = new Material(`/*glsl*/
uniform float ${uniformEndSizeInverse};
in vec2 ${varyingUv};

vec4 shader() {
  float r = 2.0 * length(${varyingUv}) * ${uniformEndSizeInverse};
  return exp(-5.0 * r * r) * (r < 0.05 ? 1.0 : 0.05 / r) * vec4(1.0);
}
`, `/*glsl*/
uniform vec3 ${uniformFocusPosition};

out vec2 ${varyingUv};

void main() {
  ${varyingUv} = ${attributePosition}.xy;
  gl_Position = ${uniformProjection} * ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0);
}
`)
}
