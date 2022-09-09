import { mat4, mat4Invert, setRotMatFromQuat } from '../math/mat4.js'
import { vec3 } from '../math/vec3.js'
import { quat, quatMultiply } from '../math/quat.js'

export const head = {
  position: vec3(),
  quaternion: quat(),
  eyesQuaternion: quat()
}

export const camera = {
  projectionMatrix: mat4(),
  viewMatrix: mat4(),
  matrix: mat4(),

  updateViewMatrix () {
    setRotMatFromQuat(camera.matrix, quatMultiply(quat(), head.quaternion, head.eyesQuaternion))

    camera.matrix[12] = head.position[0]
    camera.matrix[13] = head.position[1]
    camera.matrix[14] = head.position[2]

    mat4Invert(camera.viewMatrix, camera.matrix)
  }
}
