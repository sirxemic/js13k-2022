import { head, camera } from '../core/camera.js'
import { canvas } from '../core/context.js'
import { quat, quatMultiply, setFromUnitVectors } from '../math/quat.js'
import { applyQuat, vec3, vec3Normalize } from '../math/vec3.js'

class DesktopRig {
  constructor () {
    this.rotationSpeedX = 0
    this.rotationSpeedY = 0
  }

  start () {
    const fovY = 1
    const near = 0.1
    const far = 1000
    const aspect = canvas.width / canvas.height
    const f = 1 / Math.tan(fovY / 2)
    const nf = 1 / (near - far)

    camera.projectionMatrix = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ])
  }

  startControls () {
    document.body.requestPointerLock()
    document.body.onclick = () => document.body.requestPointerLock()
    document.addEventListener('mousemove', e => this.onMouseMove(e), false)
  }

  pause () {
    document.removeEventListener('mousemove', e => this.onMouseMove(e), false)
  }

  update (dt) {
    const forward = vec3([0, 0, -1])
    applyQuat(forward, forward, head.quaternion)

    head.position[0] += 20 * forward[0] * dt
    head.position[1] += 20 * forward[1] * dt
    head.position[2] += 20 * forward[2] * dt

    this.rotationSpeedX -= 4 * this.rotationSpeedX * dt
    this.rotationSpeedY -= 4 * this.rotationSpeedY * dt
    const movementVector = new Float32Array([this.rotationSpeedX * dt, -this.rotationSpeedY * dt, 100.0])

    vec3Normalize(movementVector)

    const rotation = quat()
    setFromUnitVectors(rotation, new Float32Array([0, 0, 1]), movementVector)
    quatMultiply(head.quaternion, head.quaternion, rotation)

    camera.updateViewMatrix()
  }

  onMouseMove (event) {
    if (document.pointerLockElement !== document.body) {
      return
    }

    this.rotationSpeedX -= 4 * (event.movementX || 0)
    this.rotationSpeedY -= 4 * (event.movementY || 0)
  }
}

export const desktopRig = new DesktopRig()
