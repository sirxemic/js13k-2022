import { gl } from '../context.js'
import { Shader } from './Shader.js'
import { SubShader } from './Subshader.js'
import {
  attributeNormal,
  attributePosition,
  attributeUv, uniformColor,
  uniformModel,
  uniformProjection,
  uniformView, varyingTexCoord
} from '../constants.js'

const common = {
  fSSC0: `/*glsl*/
precision mediump float;

out vec4 o;

in vec2 ${varyingTexCoord};

uniform vec4 ${uniformColor};`,
  fSSC1: `/*glsl*/
void main() {
  o = shader();
}`,
  vSSC0: `/*glsl*/
precision mediump float;

layout(location = 0) in vec3 ${attributePosition};
layout(location = 1) in vec2 ${attributeUv};
layout(location = 2) in vec3 ${attributeNormal};

uniform mat4 ${uniformProjection};
uniform mat4 ${uniformView};
uniform mat4 ${uniformModel};

out vec2 ${varyingTexCoord};`,
  vSSC1: `/*glsl*/
void main() {
  gl_Position = vertex();
  ${varyingTexCoord} = texcoord();
  ${varyingTexCoord}.y = 1.0 - ${varyingTexCoord}.y;
}`
}

function buildVertexShader (code) {
  return new SubShader(gl.VERTEX_SHADER, common.vSSC0 + '\n' + code + '\n' + common.vSSC1)
}

function buildFragmentShader (code) {
  return new SubShader(gl.FRAGMENT_SHADER, common.fSSC0 + '\n' + code + '\n' + common.fSSC1)
}

const defaultVertexShader = buildVertexShader(`/*glsl*/
vec4 vertex() {
  return ${uniformProjection} * ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0);
}
vec2 texcoord() {
  return ${attributeUv};
}
`)
const defaultFragmentShader = buildFragmentShader(`/*glsl*/ vec4 shader() { return ${uniformColor}; }`)

export class Material {
  constructor (customVertex = null, customTexCoord = null, customShader = null) {
    this.shader = new Shader()
    let vSS = null

    if (!customVertex && !customTexCoord) {
      this.shader.join(defaultVertexShader)
    } else if (customVertex && customTexCoord) {
      vSS = buildVertexShader(customVertex)
      this.shader.join(vSS)
    } else if (!customVertex && customTexCoord) {
      vSS = buildVertexShader('vec4 vertex() { return ${uniformProjection} * ${uniformView} * ${uniformModel} * vec4(${attributePosition}, 1.0); }')
      this.shader.join(vSS)
    } else if (customVertex && !customTexCoord) {
      vSS = buildVertexShader(`${customVertex}\nvec2 texcoord() { return ${attributeUv}; }`)
      this.shader.join(vSS)
    }

    if (!customShader) {
      this.shader.join(defaultFragmentShader)
      this.shader.link()
    } else {
      const fSS = buildFragmentShader(customShader)
      this.shader.join(fSS)
      this.shader.link()
    }

    this.shader.bind()
    this.textures = []
    this.shader.set4f(uniformColor, 1.0, 1.0, 1.0, 1.0)
  }

  setProjection (mat) {
    this.shader.bind()
    this.shader.set4x4f(uniformProjection, mat)
  }

  setView (mat) {
    this.shader.bind()
    this.shader.set4x4f(uniformView, mat)
  }

  setModel (mat) {
    this.shader.bind()
    this.shader.set4x4f(uniformModel, mat)
  }

  setColor (rgba) {
    this.shader.bind()
    this.shader.set4fv(uniformColor, rgba)
  }
}
