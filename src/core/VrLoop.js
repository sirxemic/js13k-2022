import { renderScene, updateScene } from '../world/scene.js'
import { gl } from './context.js'
import { vrRig } from '../rigs/VrRig.js'
import { camera } from './camera.js'
import { XR } from './XrContext.js'

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

    XR.session['updateRenderState']({ 'baseLayer': baseLayer })

    XR.session.addEventListener('end', () => {
      XR.session = null
      VrLoop.onEnd()
    })

    XR.startRefSpace = await XR.session['requestReferenceSpace']('local')

    XR.session.requestAnimationFrame(VrLoop.update)
  },

  update (t, frame) {
    XR.session.requestAnimationFrame(VrLoop.update)

    if (!previousT) {
      previousT = t
      return
    }

    const dt = (t - previousT) / 1000
    previousT = t

    vrRig.update(frame)

    updateScene(dt)

    gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer['framebuffer'])

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (const view of XR.pose['views']) {
      camera.projectionMatrix = view['projectionMatrix']
      camera.viewMatrix = view['transform']['inverse']['matrix']
      camera.matrix = view['transform']['matrix']

      let viewport = baseLayer['getViewport'](view)
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)

      renderScene()
    }
  }
}
