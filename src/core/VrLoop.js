import { renderUi, updateScene } from '../world/main.js'
import { gl } from './context.js'
import { vrRig } from '../rigs/VrRig.js'
import { camera, depthFar, depthNear } from './camera.js'
import { XR } from './XrContext.js'
import { renderWorld } from '../world/world.js'
import { setRig } from '../rigs/controls.js'
import { setDeltaTme } from './core.js'

let previousT

let baseLayer

export const VrLoop = {
  onEnd: () => {
  },

  async start () {
    XR.session = await XR.context['requestSession'](
      'immersive-vr',
      {
        'requiredFeatures': ['local']
      }
    )
    baseLayer = new window['XRWebGLLayer'](XR.session, gl)

    XR.session['updateRenderState']({ 'baseLayer': baseLayer, 'depthNear': depthNear, 'depthFar': depthFar })

    XR.session.addEventListener('end', () => {
      XR.session = null
      VrLoop.onEnd()
    })

    XR.startRefSpace = await XR.session['requestReferenceSpace']('local')

    XR.session.requestAnimationFrame(VrLoop.update)
    setRig(vrRig)
  },

  update (t, frame) {
    XR.session.requestAnimationFrame(VrLoop.update)

    if (!previousT) {
      previousT = t
      return
    }

    setDeltaTme(t - previousT)
    previousT = t

    vrRig.update(frame)

    updateScene()

    gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer['framebuffer'])

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (const view of XR.pose['views']) {
      camera.projectionMatrix = view['projectionMatrix']
      camera.viewMatrix = view['transform']['inverse']['matrix']
      camera.matrix = view['transform']['matrix']

      let viewport = baseLayer['getViewport'](view)
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)

      renderWorld()
      renderUi()
    }
  }
}
