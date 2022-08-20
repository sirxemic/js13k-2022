import { XR } from '../core/XrContext.js'
import { camera, head } from '../core/camera.js'
import { quat, quatInvert } from '../math/quat.js'
import { applyQuat, vec3 } from '../math/vec3.js'

class VrRig {
  constructor () {
    this.controllers = {}
  }

  update (frame) {
    // TODO: update orientation and stuff

    camera.updateViewMatrix()

    // const orientation = quatFromMat4(quat(), camera.viewMatrix)
    //
    // const transform = new window['XRRigidTransform'](
    //   {
    //     x: camera.viewMatrix[12],
    //     y: camera.viewMatrix[13],
    //     z: camera.viewMatrix[14]
    //   },
    //   {
    //     x: orientation[0],
    //     y: orientation[1],
    //     z: orientation[2],
    //     w: orientation[3],
    //   }
    // )

    const quatI = quatInvert(quat(), head.quaternion)
    const newTranslation = vec3([-head.position[0], -head.position[1], -head.position[2]])
    applyQuat(newTranslation, newTranslation, quatI)

    const transform = new window['XRRigidTransform'](
      {
         x: newTranslation[0],
         y: newTranslation[1],
         z: newTranslation[2],
      },
      {
        x: quatI[0],
        y: quatI[1],
        z: quatI[2],
        w: quatI[3],
      }
    )

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
