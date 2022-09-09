import { XR } from '../core/XrContext.js'
import { camera, head } from '../core/camera.js'
import { fromXYZW, quat, quatInvert, quatMultiply, setFromUnitVectors } from '../math/quat.js'
import { applyQuat, length, vec3, vec3Normalize } from '../math/vec3.js'

class VrRig {
  constructor () {
    this.prevAxes = [vec3(), vec3()]
    this.controlsActive = true
  }

  startControls () {
    this.controlsActive = true
  }

  pauseControls () {
    this.controlsActive = false
  }

  update (dt, frame) {
    if (this.controlsActive) {
      const inputSources = XR.session['inputSources']
      for (let i = 0; i < Math.min(2, inputSources.length); i++) {
        const inputSource = inputSources[i]
        const currentAxis = vec3([inputSource.gamepad.axes[2], inputSource.gamepad.axes[3], 0])
        if (length(currentAxis) > 0.5 && length(this.prevAxes[i]) < 0.2) {
          const movementVector = vec3([-currentAxis[0], currentAxis[1], 2.0])

          vec3Normalize(movementVector)

          const rotation = quat()
          setFromUnitVectors(rotation, vec3([0, 0, 1]), movementVector)
          quatMultiply(head.quaternion, head.quaternion, rotation)
        }

        this.prevAxes[i].set(currentAxis)
      }
    }

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

    camera.updateViewMatrix()

    head.eyesQuaternion = fromXYZW(frame['getViewerPose'](XR.startRefSpace)['views'][0]['transform']['orientation'])

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
  }
}

export const vrRig = new VrRig()
