import { renderUi, updateScene } from '../world/main.js'
import { gl } from './context.js'
import { desktopAndMobileRig } from '../rigs/DesktopAndMobileRig.js'
import { renderWorld } from '../world/world.js'
import { activeRig, setRig } from '../rigs/controls.js'
import { setDeltaTme } from './core.js'

let previousT
let raf
export const DefaultLoop = {
  start () {
    raf = window.requestAnimationFrame(DefaultLoop.update)
    desktopAndMobileRig.start()
    setRig(desktopAndMobileRig)
  },

  update (t) {
    raf = window.requestAnimationFrame(DefaultLoop.update)

    if (!previousT) {
      previousT = t
      return
    }

    setDeltaTme(t - previousT)

    previousT = t

    desktopAndMobileRig.update()

    updateScene()

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    renderWorld()
    renderUi()
  },

  stop () {
    activeRig.pauseControls()
    cancelAnimationFrame(raf)
  }
}
