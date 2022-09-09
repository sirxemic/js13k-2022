import { camera, head } from '../core/camera.js'
import { canvas } from '../core/context.js'
import { quat, quatMultiply, setFromUnitVectors } from '../math/quat.js'
import { vec3, vec3Normalize } from '../math/vec3.js'
import { mat4 } from '../math/mat4.js'

const fovY = 1

class DesktopRig {
  constructor () {
    this.rotationSpeedX = 0
    this.rotationSpeedY = 0
    this.deltaX = 0
    this.deltaY = 0

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
  }

  start () {
    const near = 0.1
    const far = 1000
    const aspect = canvas.width / canvas.height
    const f = 1 / Math.tan(fovY / 2)
    const nf = 1 / (near - far)

    camera.projectionMatrix = mat4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ])
  }

  startControls () {
    if (document.body.requestPointerLock) {
      document.body.requestPointerLock()
      document.body.onclick = () => document.body.requestPointerLock()
    }

    document.addEventListener('mousemove', this.onMouseMove)
    document.body.addEventListener('touchstart', this.onTouchStart)
    document.body.addEventListener('touchmove', this.onTouchMove)
    document.body.addEventListener('touchend', this.onTouchEnd)
  }

  pauseControls () {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.body.removeEventListener('touchstart', this.onTouchStart)
    document.body.removeEventListener('touchmove', this.onTouchMove)
    document.body.removeEventListener('touchend', this.onTouchEnd)
  }

  update (dt) {
    if (!this.previousTouch && (this.deltaX || this.deltaY)) {
      this.rotationSpeedX = this.deltaX / dt
      this.rotationSpeedY = this.deltaY / dt
    }

    this.rotationSpeedX -= 4 * this.rotationSpeedX * dt
    this.rotationSpeedY -= 4 * this.rotationSpeedY * dt

    const movementVector = vec3([this.deltaX + this.rotationSpeedX * dt, -this.deltaY - this.rotationSpeedY * dt, 1.0])
    this.deltaX = 0
    this.deltaY = 0

    vec3Normalize(movementVector)

    const rotation = quat()
    setFromUnitVectors(rotation, vec3([0, 0, 1]), movementVector)
    quatMultiply(head.quaternion, head.quaternion, rotation)

    camera.updateViewMatrix()
  }

  onMouseMove (event) {
    if (document.pointerLockElement !== document.body) {
      return
    }

    this.rotationSpeedX -= 0.04 * (event.movementX || 0)
    this.rotationSpeedY -= 0.04 * (event.movementY || 0)
  }

  onTouchStart (event) {
    this.previousTouch = event.changedTouches[0]
  }

  onTouchMove (event) {
    const touch = event.changedTouches[0]

    const anglePrevX = (this.previousTouch.screenX - canvas.width / 2) / (canvas.height / 2)
    const anglePrevY = (this.previousTouch.screenY - canvas.height / 2) / (canvas.height / 2)
    const angleX = (touch.screenX - canvas.width / 2) / (canvas.height / 2)
    const angleY = (touch.screenY - canvas.height / 2) / (canvas.height / 2)

    const z = 1 / Math.tan(fovY / 2)

    this.deltaX = 2 * Math.tan(Math.atan(angleX / z) - Math.atan(anglePrevX / z))
    this.deltaY = 2 * Math.tan(Math.atan(angleY / z) - Math.atan(anglePrevY / z))

    this.previousTouch = touch
  }

  onTouchEnd () {
    this.previousTouch = null
  }
}

export const desktopRig = new DesktopRig()
