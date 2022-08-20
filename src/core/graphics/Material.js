import { gl } from '../context.js'
import { Shader } from './Shader.js'
import { SubShader } from './Subshader.js'
import {
  attributePosition,

  uniformCameraPosition,
  uniformColor,
  uniformModel,
  uniformProjection,
  uniformTextures,
  uniformView,

  varyingPosition
} from '../constants.js'
import { camera } from '../camera.js'

const common = {
  fSSC0: `/*glsl*/
precision highp float;

out vec4 o;

uniform vec4 ${uniformColor};
uniform sampler2D ${uniformTextures}[16];

in vec3 ${varyingPosition};
`,
  fSSC1: `/*glsl*/
void main() {
  o = shader();
}`,
  vSSC0: `/*glsl*/
precision highp float;

layout(location = 0) in vec3 ${attributePosition};

uniform mat4 ${uniformProjection};
uniform mat4 ${uniformView};
uniform mat4 ${uniformModel};
uniform vec3 ${uniformCameraPosition};

out vec3 ${varyingPosition};
`,
  vSSC1: `/*glsl*/
void main() {
  vertex();
  gl_Position = ${uniformProjection} * ${uniformView} * vec4(${varyingPosition}, 1.0);
}`
}

function buildVertexShader (code) {
  return new SubShader(gl.VERTEX_SHADER, common.vSSC0 + '\n' + code + '\n' + common.vSSC1)
}

function buildFragmentShader (code) {
  return new SubShader(gl.FRAGMENT_SHADER, common.fSSC0 + '\n' + code + '\n' + common.fSSC1)
}

const defaultVertexShader = buildVertexShader(`/*glsl*/
void vertex() {
  ${varyingPosition} = vec3(${uniformModel} * vec4(${attributePosition}, 1.0));
}
`)

export class Material {
  constructor (fragmentShader, customVertex) {
    this.shader = new Shader()
    let vSS = null

    if (!customVertex) {
      this.shader.join(defaultVertexShader)
    } else {
      vSS = buildVertexShader(customVertex)
      this.shader.join(vSS)
    }

    const fSS = buildFragmentShader(fragmentShader)
    this.shader.join(fSS)
    this.shader.link()

    this.shader.bind()
    this.textures = []
    for(let i = 0; i < 16; i++) {
      this.shader.set1i(`${uniformTextures}[${i}]`, i)
    }
  }

  updateCameraUniforms () {
    this.shader.bind()
    this.shader.set4x4f(uniformProjection, camera.projectionMatrix)
    this.shader.set3fv(uniformCameraPosition, camera.matrix.slice(12, 15))
    this.shader.set4x4f(uniformView, camera.viewMatrix)
  }

  setModel (mat) {
    this.shader.bind()
    this.shader.set4x4f(uniformModel, mat)
  }

  setTexture (texture, slot = 0) {
    this.textures[slot] = texture
  }
}
