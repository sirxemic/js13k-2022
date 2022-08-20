import { XR } from '../core/XrContext.js'
import { camera, getViewMatrix } from '../core/camera.js'
import { setRig } from '../core/globals.js'
import { quatFromMat4 } from '../math/quat.js'

class VrRig {
  constructor () {
    this.controllers = {}
  }

  start () {
    setRig(this)
  }

  update (frame) {
    // TODO: update orientation and stuff

    camera.updateViewMatrix()

    const transform = new window['XRRigidTransform']
    transform.matrix.set(camera.viewMatrix)

    const refSpace = XR.startRefSpace['getOffsetReferenceSpace'](transform)

    XR.pose = frame['getViewerPose'](refSpace)

    for (let inputSource of XR.session['inputSources']) {
      if (inputSource['gripSpace']) {
        let gripPose = frame['getPose'](inputSource['gripSpace'], refSpace)

        if (gripPose) {
          this.controllers[inputSource['handedness']] = {
            pose: gripPose,
            gamepadButtons: inputSource.gamepad.buttons
          }
        }
      }
    }
  }
}

export const vrRig = new VrRig()
