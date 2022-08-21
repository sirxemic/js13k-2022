import { updateScene } from '../world/main.js'
import { gl } from './context.js'
import { desktopRig } from '../rigs/DesktopRig.js'
import { renderWorld } from '../world/world.js'

let previousT
let raf
export const DefaultLoop = {
  start () {
    raf = window.requestAnimationFrame(DefaultLoop.update)
    desktopRig.start()
  },

  update (t) {
    raf = window.requestAnimationFrame(DefaultLoop.update)

    if (!previousT) {
      previousT = t
      return
    }

    const dt = (t - previousT) / 1000
    previousT = t

    desktopRig.update(dt)

    updateScene(dt)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    renderWorld()
  },

  stop () {
    desktopRig.pause()
    cancelAnimationFrame(raf)
  }
}
