import { gl } from '../context.js'

export class Shader {
  constructor () {
    this.program = gl.createProgram()
  }

  join (subshader) {
    gl.attachShader(this.program, subshader.shader)
    return this
  }

  link () {
    gl.linkProgram(this.program)
    gl.useProgram(this.program)
    gl.useProgram(null)
    return this
  }

  bind () {
    gl.useProgram(this.program)
    return this
  }

  unbind () {
    gl.useProgram(null)
    return this
  }

  set1i (name, val) {
    gl.uniform1i(gl.getUniformLocation(this.program, name), val)
    return this
  }

  set1f (name, val) {
    gl.uniform1f(gl.getUniformLocation(this.program, name), val)
    return this
  }

  set2f (name, x, y) {
    gl.uniform2f(gl.getUniformLocation(this.program, name), x, y)
    return this
  }

  set3f (name, x, y, z) {
    gl.uniform3f(gl.getUniformLocation(this.program, name), x, y, z)
    return this
  }

  set3fv (name, xyz) {
    gl.uniform3fv(gl.getUniformLocation(this.program, name), xyz)
    return this
  }

  set4f (name, x, y, z, w) {
    gl.uniform4f(gl.getUniformLocation(this.program, name), x, y, z, w)
    return this
  }

  set4fv (name, xyzw) {
    gl.uniform4fv(gl.getUniformLocation(this.program, name), xyzw)
    return this
  }

  set4x4f (name, mat) {
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, name), false, mat)
    return this
  }
}
