import { Material } from '../core/graphics/Material.js'
import {
  attributePosition,
  uniformModel,
  uniformProjection,
  uniformTextures,
  uniformView,
  varyingPosition,
  varyingUv
} from '../core/constants.js'

export let uiTextMaterial

export function loadUiTextMaterial () {
  uiTextMaterial = new Material(`/*glsl*/
in vec2 ${varyingUv};
vec4 shader() {
  return texture(${uniformTextures}[0], ${varyingUv});
}
`, `/*glsl*/
out vec2 ${varyingUv};
void main() {
  ${varyingUv} = ${attributePosition}.xy * 0.5 + 0.5;
  ${varyingUv}.y = 1.0 - ${varyingUv}.y;
  ${varyingPosition} = vec3(${uniformModel} * vec4(${attributePosition}, 1.0));
  gl_Position = ${uniformProjection} * ${uniformView} * vec4(${varyingPosition}, 1.0);
}
`)
}
