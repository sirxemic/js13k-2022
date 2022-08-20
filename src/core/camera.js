import { mat4Invert } from '../math/mat4.js'

export const head = {
  position: new Float32Array(4),
  quaternion: new Float32Array([0, -Math.SQRT1_2, 0, Math.SQRT1_2])
}

export const camera = {
  projectionMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  viewMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),

  updateViewMatrix () {
    const x = head.quaternion[0]
    const y = head.quaternion[1]
    const z = head.quaternion[2]
    const w = head.quaternion[3]

    camera.matrix.set([
      1 - (y * y + z * z) * 2, (x * y + w * z) * 2, (x * z - w * y) * 2, 0,
      (x * y - w * z) * 2, 1 - (x * x + z * z) * 2, (y * z + w * x) * 2, 0,
      (x * z + w * y) * 2, (y * z - w * x) * 2, 1 - (x * x + y * y) * 2, 0,
      head.position[0], head.position[1], head.position[2], 1
    ])

    mat4Invert(camera.viewMatrix, camera.matrix)
  }
}
