import { VrLoop } from './core/VrLoop.js'
import { DefaultLoop } from './core/DefaultLoop.js'
import { startButton, vrButton, ui } from './ui.js'
import { mat4Invert } from './math/mat4.js'
import { camera } from './core/camera.js'

function toggleVrButton (show) {
  vrButton.hidden = !show
}

VrLoop.onEnd = () => {
  toggleVrButton(true)
  DefaultLoop.start()
}

vrButton.onclick = () => {
  toggleVrButton(false)

  DefaultLoop.stop()
  VrLoop.start()
}

startButton.onclick = () => {
  ui.hidden = true
}

DefaultLoop.start()

const x = Math.sqrt(2)
const y = 0
const z = 0
const w = Math.sqrt(2)

const x2 = x + x,	y2 = y + y, z2 = z + z
const xx = x * x2, xy = x * y2, xz = x * z2
const yy = y * y2, yz = y * z2, zz = z * z2
const wx = w * x2, wy = w * y2, wz = w * z2

const test = new Float32Array(16)
test.set([
  1 - yy - zz,     xy + wz,     xz - wy, 0,
  xy - wz, 1 - xx - zz,     yz + wx, 0,
  xz + wy,     yz - wx, 1 - xx - yy, 0,
  10, 20, 30, 1
])

mat4Invert(test, test)
console.log(test)
