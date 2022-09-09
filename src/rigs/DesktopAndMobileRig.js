import { camera, head } from '../core/camera.js'
import { canvas } from '../core/context.js'
import { quat, quatInvert, quatMultiply, setFromAxisAngle, setFromUnitVectors } from '../math/quat.js'
import { vec3, vec3Normalize } from '../math/vec3.js'
import { mat4 } from '../math/mat4.js'
import { DEG2RAD } from '../math/math.js'
import { deltaTime } from '../core/core.js'

const fovY = 1

// <debug>
const keys = {}
document.addEventListener('keydown', (e) => { keys[e.key] = true })
document.addEventListener('keyup', (e) => { keys[e.key] = false })
// </debug>

export const desktopAndMobileRig = {
  rotationSpeedX: 0,
  rotationSpeedY: 0,
  deltaX: 0,
  deltaY: 0,

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
  },

  async startControls () {
    if (document.body.requestPointerLock) {
      document.body.requestPointerLock()
      document.body.onclick = () => document.body.requestPointerLock()

      document.addEventListener('mousemove', desktopAndMobileRig.onMouseMove)
    }

    if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
      await window.DeviceOrientationEvent.requestPermission()

      document.body.addEventListener('touchstart', desktopAndMobileRig.onTouchStart)
      document.body.addEventListener('touchmove', desktopAndMobileRig.onTouchMove)
      document.body.addEventListener('touchend', desktopAndMobileRig.onTouchEnd)

      window.addEventListener('deviceorientation', desktopAndMobileRig.onDeviceOrientationChange, false)
    }
  },

  pauseControls () {
    document.removeEventListener('mousemove', desktopAndMobileRig.onMouseMove)
    document.body.removeEventListener('touchstart', desktopAndMobileRig.onTouchStart)
    document.body.removeEventListener('touchmove', desktopAndMobileRig.onTouchMove)
    document.body.removeEventListener('touchend', desktopAndMobileRig.onTouchEnd)
  },

  update () {
    if (!desktopAndMobileRig.previousTouch && (desktopAndMobileRig.deltaX || desktopAndMobileRig.deltaY)) {
      desktopAndMobileRig.rotationSpeedX = desktopAndMobileRig.deltaX / deltaTime
      desktopAndMobileRig.rotationSpeedY = desktopAndMobileRig.deltaY / deltaTime
    }

    desktopAndMobileRig.rotationSpeedX -= 4 * desktopAndMobileRig.rotationSpeedX * deltaTime
    desktopAndMobileRig.rotationSpeedY -= 4 * desktopAndMobileRig.rotationSpeedY * deltaTime

    const movementVector = vec3([
      desktopAndMobileRig.deltaX + desktopAndMobileRig.rotationSpeedX * deltaTime,
      -desktopAndMobileRig.deltaY - desktopAndMobileRig.rotationSpeedY * deltaTime,
      1.0
    ])
    desktopAndMobileRig.deltaX = 0
    desktopAndMobileRig.deltaY = 0

    vec3Normalize(movementVector)

    const rotation = quat()

    // applyQuat(movementVector, movementVector, head.eyesQuaternion)
    // setFromUnitVectors(rotation, applyQuat(vec3(), vec3([0, 0, 1]), head.eyesQuaternion), movementVector)

    setFromUnitVectors(rotation, vec3([0, 0, 1]), movementVector)
    quatMultiply(rotation, quatMultiply(rotation, head.eyesQuaternion, rotation), quatInvert(quat(), head.eyesQuaternion))

    quatMultiply(head.quaternion, head.quaternion, rotation)

    camera.updateViewMatrix()
  },

  onMouseMove (event) {
    if (document.pointerLockElement !== document.body) {
      return
    }

    desktopAndMobileRig.rotationSpeedX -= 0.04 * (event.movementX || 0)
    desktopAndMobileRig.rotationSpeedY -= 0.04 * (event.movementY || 0)
  },

  onTouchStart (event) {
    desktopAndMobileRig.previousTouch = event.changedTouches[0]
  },

  onTouchMove (event) {
    const touch = event.changedTouches[0]

    const prevX = (desktopAndMobileRig.previousTouch.screenX - canvas.width / 2) / (canvas.height / 2)
    const prevY = (desktopAndMobileRig.previousTouch.screenY - canvas.height / 2) / (canvas.height / 2)
    const x = (touch.screenX - canvas.width / 2) / (canvas.height / 2)
    const y = (touch.screenY - canvas.height / 2) / (canvas.height / 2)

    desktopAndMobileRig.deltaX = x - prevX
    desktopAndMobileRig.deltaY = y - prevY

    desktopAndMobileRig.previousTouch = touch
  },

  onTouchEnd () {
    desktopAndMobileRig.previousTouch = 0
  },

  onDeviceOrientationChange (event) {
    const alpha = event.alpha ? DEG2RAD * event.alpha : 0
    const beta = event.beta ? DEG2RAD * event.beta : 0
    const gamma = event.gamma ? DEG2RAD * event.gamma : 0
    const orient = DEG2RAD * ((window['orientation'] ?? screen.orientation.angle) || 0)

    const minusPiOverTwoAroundX = quat([-Math.SQRT1_2, 0, 0, Math.SQRT1_2])

    const c1 = Math.cos(beta / 2)
    const c2 = Math.cos(alpha / 2)
    const c3 = Math.cos(-gamma / 2)

    const s1 = Math.sin(beta / 2)
    const s2 = Math.sin(alpha / 2)
    const s3 = Math.sin(-gamma / 2)

    const target = quat([
      s1 * c2 * c3 + c1 * s2 * s3,
      c1 * s2 * c3 - s1 * c2 * s3,
      c1 * c2 * s3 - s1 * s2 * c3,
      c1 * c2 * c3 + s1 * s2 * s3
    ])

    quatMultiply(target, target, minusPiOverTwoAroundX)
    quatMultiply(target, target, setFromAxisAngle(quat(), [0, 0, 1], -orient))

    if (!desktopAndMobileRig.initialQuaternion) {
      desktopAndMobileRig.initialQuaternion = quatInvert(target, target)
    } else {
      quatMultiply(head.eyesQuaternion, desktopAndMobileRig.initialQuaternion, target)
    }
  }
}
