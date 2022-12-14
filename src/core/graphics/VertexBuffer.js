import { gl } from '../context.js'

export class VertexBuffer {
  constructor (type = gl.TRIANGLES) {
    this.type = type

    this.va = gl.createVertexArray()
    gl.bindVertexArray(this.va)

    this.vb = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb)

    this.stride = 0
    this.length = 0
    this.vertices = 0

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)
  }

  vertexLayout (layout = [3, 2, 3]) {
    for (let i = 0; i < layout.length; i++) {
      this.stride += layout[i] * 4
    }

    gl.bindVertexArray(this.va)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb)

    let istride = 0
    for (let i = 0; i < layout.length; i++) {
      gl.vertexAttribPointer(i, layout[i], gl.FLOAT, false, this.stride, istride)
      gl.enableVertexAttribArray(i)

      istride += layout[i] * 4
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)

    this.stride = this.stride / 4
    this.vertices = this.length / this.stride
  }

  vertexData (data) {
    this.length = data.length
    gl.bindVertexArray(this.va)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    this.vertices = this.length / this.stride
  }

  updateVertexData (data) {
    gl.bindVertexArray(this.va)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data)
  }

  draw () {
    gl.bindVertexArray(this.va)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb)

    gl.drawArrays(this.type, 0, this.vertices)
  }
}
