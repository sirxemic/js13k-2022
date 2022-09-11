import { VertexBuffer } from '../core/graphics/VertexBuffer.js'

export const skyGeometry = new VertexBuffer()
skyGeometry.vertexLayout([3])
skyGeometry.vertexData(new Float32Array([
  // Prism instead of a cube - saves data :P
  -1, -1, -1,
  1, -1, -1,
  0, 1, -1,

  -1, -1, -1,
  0, 0, 1,
  0, 1, -1,

  1, -1, -1,
  0, 0, 1,
  -1, -1, -1,

  0, 1, -1,
  0, 0, 1,
  1, -1, -1
]))
