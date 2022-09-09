import { Material } from '../core/graphics/Material.js'
import { attributePosition, uniformColor } from '../core/constants.js'

export let fadeMaterial

export function loadFadeMaterial () {
  fadeMaterial = new Material(`/*glsl*/
vec4 shader() {
  return ${uniformColor};
}
`, `/*glsl*/
void main() {
  gl_Position = vec4(${attributePosition}, 1.0);
}
`)
}
