import { mat4Invert } from '../math/mat4.js'

export const camera = {
  projectionMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  viewMatrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  position: new Float32Array(4),
  quaternion: new Float32Array([0, 0, 0, 1]),
  updateViewMatrix () {
    const x = camera.quaternion[0]
    const y = camera.quaternion[1]
    const z = camera.quaternion[2]
    const w = camera.quaternion[3]

    camera.viewMatrix.set([
      1 - (y * y + z * z) * 2, (x * y + w * z) * 2, (x * z - w * y) * 2, 0,
      (x * y - w * z) * 2, 1 - (x * x + z * z) * 2, (y * z + w * x) * 2, 0,
      (x * z + w * y) * 2, (y * z - w * x) * 2, 1 - (x * x + y * y) * 2, 0,
      camera.position[0], camera.position[1], camera.position[2], 1
    ])

    mat4Invert(camera.viewMatrix)
  }
}
