import { VertexBuffer } from './VertexBuffer.js'

export class Mesh {
  constructor() {
    this.vertexbuffer = new VertexBuffer()
    this.vertexbuffer.vertexLayout([3, 2, 3])
  }

  loadFromData (data) {
    this.vertexbuffer.vertexData(data)
  }
}
