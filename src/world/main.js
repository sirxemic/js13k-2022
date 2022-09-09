import { camera, head } from '../core/camera.js'
import { audioMix } from '../assets/audioMix.js'
import {
  currentTime,
  focus,
  progress,
  resetPosition,
  updateFocus,
  updateParticles,
  updateTime,
  updateTrack, updateViz
} from './world.js'
import { mainTrack, mainTrackEndingStart } from './track.js'
import { CAMERA_SPEED, FLOW_RADIUS, SCALE, VIEW_DISTANCE } from '../constants.js'
import { addScaled, applyQuat, distance, vec3 } from '../math/vec3.js'
import { saturate } from '../math/math.js'
import { gl } from '../core/context.js'
import { fadeMaterial } from '../assets/fadeMaterial.js'
import { uniformColor } from '../core/constants.js'
import { draw } from '../core/renderer.js'
import { quad } from '../assets/quad.js'
import { mouseDown, toggleControls } from '../rigs/controls.js'
import { kickFade, kickStart } from '../assets/mainSong.js'
import { uiTextMaterial } from '../assets/uiTextMaterial.js'
import { loseText, winText } from '../assets/texts.js'
import { mat4, mat4Mult } from '../math/mat4.js'
import { reload } from '../utils.js'

const STATE_MENU = 0
const STATE_PLAYING = 1
const STATE_DYING = 2
const STATE_WINNING = 3

let state = STATE_MENU
let musicVolume
let noiseVolume

const fadeColor = new Float32Array([0, 0, 0, 0])
let fadeAmount = 0

export function setMainScene () {
  state = STATE_PLAYING
  updateTrack(mainTrack)

  resetPosition()
}

let speedScale = 0

export function updateScene (dt) {
  const forward = vec3([0, 0, -1])
  applyQuat(forward, forward, head.eyesQuaternion)
  applyQuat(forward, forward, head.quaternion)

  speedScale = Math.max(0, speedScale + (mouseDown ? dt : -0.3 * dt))
  const scale = Math.pow(2, speedScale)

  addScaled(head.position, head.position, forward, scale * CAMERA_SPEED * dt)

  if (state !== STATE_WINNING && distance(head.position, focus) < VIEW_DISTANCE) {
    updateFocus(dt)
  }

  updateParticles(dt)

  if (state === STATE_MENU) {
    introUpdate(dt)
  } else {
    mainUpdate(dt)
  }
}

export function introUpdate () {
  if (head.position[0] > 100 * SCALE) {
    resetPosition()
  }
}

export function mainUpdate (dt) {
  updateTime(dt)

  if (state === STATE_PLAYING) {
    const dist = distance(head.position, focus)

    const FADE_START = FLOW_RADIUS
    const FADE_RANGE = VIEW_DISTANCE - FLOW_RADIUS

    musicVolume = saturate(1 - (dist - FADE_START) / (FADE_RANGE / 2))
    noiseVolume = saturate((dist - FADE_START) / FADE_RANGE)

    if (dist > VIEW_DISTANCE * 1.5) {
      state = STATE_DYING
      toggleControls(false)
    } else if (progress > mainTrackEndingStart) {
      state = STATE_WINNING
      toggleControls(false)
    }
  } else if (state === STATE_DYING) {
    fadeAmount = saturate(fadeAmount + dt * 0.1)
    if (fadeAmount === 1) {
      reload()
      return
    }
    fadeColor[3] += dt / 3

    noiseVolume = saturate(1 - fadeColor[3] / 2)
  } else if (state === STATE_WINNING) {
    fadeAmount = saturate(fadeAmount + dt * 0.1)
    const factor = 1 - Math.exp(-dt * 20)

    fadeColor[0] = fadeColor[1] = fadeColor[2] = 1
    fadeColor[3] += (1 - fadeColor[3]) * factor / 10

    musicVolume += (1 - musicVolume) * factor
    noiseVolume -= noiseVolume * factor
  }

  updateExperience()

  audioMix.setMusicProgress(progress)
  audioMix.setMusicVolume(musicVolume)
  audioMix.setFxVolume(noiseVolume)
}

function updateExperience () {
  const kickAmount = saturate((progress - kickStart) / kickFade) ** 4
  const measurePos = (currentTime % 1.6) / 1.6
  let beatViz = 0
  if (measurePos < 0.25) {
    beatViz = (0.25 - measurePos) * 4
  } else if (measurePos > 5/8 && measurePos < 7/8) {
    beatViz = (7/8 - measurePos) * 4
  }

  let snareViz = 0
  if (measurePos >= 0.25 && measurePos < 0.5) {
    snareViz = (0.5 - measurePos) * 4
  } else if (measurePos >= 0.75 && measurePos) {
    snareViz = (1 - measurePos) * 4
  }

  updateViz(
    beatViz * musicVolume * kickAmount,
    snareViz * musicVolume * kickAmount
  )
}

export function renderUi () {
  gl.enable(gl.BLEND)
  gl.depthMask(false)
  gl.disable(gl.DEPTH_TEST)
  gl.blendFunc(gl.SRC_ALPHA, fadeColor[0] === 0 ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE)
  fadeMaterial.shader.bind()
  fadeMaterial.shader.set4fv(uniformColor, fadeColor)
  draw(quad, fadeMaterial)

  let finalStateText
  if (state === STATE_WINNING) {
    finalStateText = winText
  } else if (state === STATE_DYING) {
    finalStateText = loseText
  }
  if (finalStateText) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    uiTextMaterial.shader.bind()
    uiTextMaterial.setTexture(finalStateText.texture)
    uiTextMaterial.updateCameraUniforms()

    const model = mat4([
      1, 0, 0, 0,
      0, 1 / finalStateText.ratio, -0.05, 0,
      0, -0.05, 1, 0,
      0, 0, -10 * (1 - fadeAmount) ** 2 - 5, 1
    ])

    mat4Mult(model, camera.matrix, model)

    uiTextMaterial.setModel(model)
    draw(quad, uiTextMaterial)
  }

  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
}
