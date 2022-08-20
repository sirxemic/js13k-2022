import { camera, getViewMatrix } from '../core/camera.js'
import { canvas } from '../core/context.js'
import { setRig } from '../core/globals.js'
import { mat4Invert } from '../math/mat4.js'

class DesktopRig {
  start () {
    document.addEventListener('mousemove', e => this.onMouseMove(e), false)

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

    setRig(this)
  }

  pause () {
    document.removeEventListener('mousemove', e => this.onMouseMove(e), false)
  }

  update (dt) {
    camera.updateViewMatrix()
  }

  onMouseMove (event) {

  }
}

export const desktopRig = new DesktopRig()
