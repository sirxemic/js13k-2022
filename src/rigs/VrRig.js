import { XR } from '../core/XrContext.js'
import { head, moveHead } from '../core/camera.js'
import { fromXYZW, quat, quatInvert, quatMultiply, setFromUnitVectors } from '../math/quat.js'
import { applyQuat, length, vec3, vec3Normalize } from '../math/vec3.js'
import { updateMouseDown } from './controls.js'

export const vrRig = {
  prevAxes: [vec3(), vec3()],
  controlsActive: false,

  startControls () {
    vrRig.controlsActive = true

    XR.session.addEventListener('selectstart', vrRig.onSelectStart)
    XR.session.addEventListener('selectend', vrRig.onSelectEnd)
  },

  pauseControls () {
    vrRig.controlsActive = false
    XR.session.removeEventListener('selectstart', vrRig.onSelectStart)
    XR.session.removeEventListener('selectend', vrRig.onSelectEnd)
  },

  onSelectStart () {
    updateMouseDown(true)
  },

  onSelectEnd () {
    updateMouseDown(false)
  },

  update (frame) {
    head.eyesQuaternion = fromXYZW(frame['getViewerPose'](XR.startRefSpace)['views'][0]['transform']['orientation'])

    if (vrRig.controlsActive) {
      const inputSources = XR.session['inputSources']
      for (let i = 0; i < Math.min(2, inputSources.length); i++) {
        const inputSource = inputSources[i]
        const currentAxis = vec3([inputSource.gamepad.axes[2], inputSource.gamepad.axes[3], 0])
        if (length(currentAxis) > 0.5 && length(vrRig.prevAxes[i]) < 0.2) {
          moveHead(vec3([-currentAxis[0], currentAxis[1], 2.0]))
        }

        vrRig.prevAxes[i].set(currentAxis)
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
  }
}
