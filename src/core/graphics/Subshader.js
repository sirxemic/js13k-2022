import { gl } from '../context.js'

export class SubShader {
  constructor (type, source) {
    this.shader = gl.createShader(type)
    gl.shaderSource(this.shader, '#version 300 es\n' + source)
    gl.compileShader(this.shader)

    // <dev-only>
    const message = gl.getShaderInfoLog(this.shader)
    if (message.length > 0) {
      console.warn(source.split('\n').map((line, index) => `${index +1} ${line}`).join('\n'))
      throw new Error('compile error: ' + gl.getShaderInfoLog(this.shader))
    }
    // </dev-only>
  }
}
