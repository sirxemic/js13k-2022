import { mat4, mat4Invert, setRotMatFromQuat } from '../math/mat4.js'
import { vec3, vec3Normalize } from '../math/vec3.js'
import { quat, quatInvert, quatMultiply, setFromUnitVectors } from '../math/quat.js'

export const head = {
  position: vec3(),
  quaternion: quat(),
  eyesQuaternion: quat()
}

export function moveHead (movementVector) {
  vec3Normalize(movementVector)

  const rotation = quat()
  setFromUnitVectors(rotation, vec3([0, 0, 1]), movementVector)
  quatMultiply(rotation, quatMultiply(rotation, head.eyesQuaternion, rotation), quatInvert(quat(), head.eyesQuaternion))

  quatMultiply(head.quaternion, head.quaternion, rotation)
}

export const camera = {
  projectionMatrix: mat4(),
  viewMatrix: mat4(),
  matrix: mat4(),

  // For non-VR!
  updateViewMatrix () {
    setRotMatFromQuat(camera.matrix, quatMultiply(quat(), head.quaternion, head.eyesQuaternion))

    camera.matrix[12] = head.position[0]
    camera.matrix[13] = head.position[1]
    camera.matrix[14] = head.position[2]

    mat4Invert(camera.viewMatrix, camera.matrix)
  }
}
