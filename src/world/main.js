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
import { mainTrack } from './track.js'
import { CAMERA_SPEED, FLOW_RADIUS, SCALE, VIEW_DISTANCE } from '../constants.js'
import { addScaled, applyQuat, distance, length, vec3 } from '../math/vec3.js'
import { saturate } from '../math/math.js'
import { gl } from '../core/context.js'
import { fadeMaterial } from '../assets/materials/fadeMaterial.js'
import { uniformColor } from '../core/constants.js'
import { draw } from '../core/renderer.js'
import { quad } from '../assets/geometries/quad.js'
import { activeRig, mouseDown } from '../rigs/controls.js'
import {
  bassFade,
  bassStart, chordsFade, chordsStart, hihatsFade, hihatsStart,
  kickFade,
  kickStart, leadsFade, leadsStart,
  snareFade,
  snareStart, softLeadFade, softLeadStart,
  subtlePadFade,
  subtlePadStart
} from '../assets/audio/mainSong.js'
import { uiTextMaterial } from '../assets/materials/uiTextMaterial.js'
import { loseText, winText } from '../assets/textures/texts.js'
import { mat4, mat4Mult } from '../math/mat4.js'
import { reload } from '../utils.js'
import { deltaTime } from '../core/core.js'

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

export function updateScene () {
  let scale = 0
  if (state !== STATE_WINNING) {
    speedScale = Math.max(0, speedScale + (mouseDown ? deltaTime : -0.3 * deltaTime))
    scale = Math.pow(2, speedScale)
  }

  const forward = vec3([0, 0, -1])
  applyQuat(forward, forward, head.eyesQuaternion)
  applyQuat(forward, forward, head.quaternion)

  addScaled(head.position, head.position, forward, scale * CAMERA_SPEED * deltaTime)

  if (state === STATE_MENU) {
    introUpdate()
  } else {
    mainUpdate()
  }

  if (state !== STATE_WINNING && distance(head.position, focus) < VIEW_DISTANCE) {
    updateFocus()
  }

  camera.updateViewMatrix()

  updateParticles()
}

export function introUpdate () {
  if (length(head.position) > 100 * SCALE) {
    resetPosition()
  }
}

let fadeOut = 0

export function mainUpdate () {
  updateTime()

  if (state === STATE_PLAYING) {
    const dist = distance(head.position, focus)

    const FADE_START = FLOW_RADIUS
    const FADE_RANGE = VIEW_DISTANCE - FLOW_RADIUS

    musicVolume = saturate(1 - (dist - FADE_START) / (FADE_RANGE / 2))
    noiseVolume = saturate((dist - FADE_START) / FADE_RANGE)

    if (dist > VIEW_DISTANCE * 1.5) {
      state = STATE_DYING
      activeRig.pauseControls()
    } else if (distance(head.position, mainTrack.getLastPoint()) < 2 * FLOW_RADIUS) {
      state = STATE_WINNING
      activeRig.pauseControls()
    }
  } else if (state === STATE_DYING) {
    fadeAmount = saturate(fadeAmount + deltaTime * 0.1)
    if (fadeAmount === 1) {
      reload()
      return
    }
    fadeColor[3] += deltaTime / 3

    noiseVolume = saturate(1 - fadeColor[3] / 2)
  } else if (state === STATE_WINNING) {
    fadeAmount = saturate(fadeAmount + deltaTime * 0.1)
    const factor = 1 - Math.exp(-deltaTime * 20)

    fadeColor[0] = fadeColor[1] = fadeColor[2] = 1
    fadeColor[3] += (1 - fadeColor[3]) * factor / 10

    musicVolume += (1 - musicVolume) * factor
    noiseVolume -= noiseVolume * factor
  }

  updateExperience()

  if (state === STATE_WINNING) {
    fadeOut += deltaTime
    audioMix.setMusicEnd(fadeOut / 5)
  } else {
    audioMix.setMusicProgress(progress)
  }
  audioMix.setMusicVolume(musicVolume)
  audioMix.setFxVolume(noiseVolume)
}

const flowSpeeds = [
  [[0, 1]], // measure 1
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 2
  [[0, 1]], // measure 3
  [[0, 0], [1.75, 1], [2, 0]], // measure 4
  [[0, 1]], // measure 5
  [[0, 0], [1.75, 1], [2, 0]], // measure 6
  [[0, 1]], // measure 7
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 8
  [[0, 1]], // measure 9
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 10
  [[0, 1]], // measure 11
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 12
  [[0, 1]], // measure 13
  [[0, 1]], // measure 14
  [[0, 0], [3.75, 1]], // measure 15
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 16

  [[0, 1]], // measure 17
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 18
  [[0, 1]], // measure 19
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 20
  [[0, 1]], // measure 21
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 22
  [[0, 1]], // measure 23
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 24
  [[0, 1]], // measure 25
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 26
  [[0, 1]], // measure 27
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 28
  [[0, 1]], // measure 29
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 30
  [[0, 1]], // measure 31
  [[0, 0], [1.75, 1], [2, 0], [3.75, 1]], // measure 32
  [[0, 1]] // measure 33
]

function updateExperience () {
  const bassAmount = saturate((progress - bassStart) / bassFade) ** 4
  const subtlePadAmount = saturate((progress - subtlePadStart) / subtlePadFade) ** 4
  const softLeadAmount = saturate((progress - softLeadStart) / softLeadFade) ** 4
  const kickAmount = saturate((progress - kickStart) / kickFade) ** 4
  const snareAmount = saturate((progress - snareStart) / snareFade) ** 4
  const hihatsAmount = saturate((progress - hihatsStart) / hihatsFade) ** 4
  const chordsAmount = saturate((progress - chordsStart) / chordsFade) ** 4
  const leadsAmount = saturate((progress - leadsStart) / leadsFade) ** 4

  const channelCount = (
    bassAmount +
    subtlePadAmount +
    softLeadAmount +
    kickAmount +
    snareAmount +
    hihatsAmount +
    chordsAmount +
    leadsAmount
  )

  let measure = Math.floor((currentTime / 1.6) % 33)
  let measurePos = (currentTime % 1.6) / 1.6
  let beatViz
  if (measure !== 15 && measurePos > 5/8) {
    beatViz = 1 - (measurePos - 5/8) * 4
  } else {
    beatViz = 1 - measurePos * 4
  }

  let snareViz = 0
  if (measure % 4 === 3 && measurePos >= 7/8) {
    snareViz = 1 - (measurePos - 7/8) * 4
  } else if (measurePos >= 3/4) {
    snareViz = 1 - (measurePos - 3/4) * 4
  } else if (measurePos >= 1/4) {
    snareViz = 1 - (measurePos - 1/4) * 4
  } else if (measure % 4 === 0 && measure > 0) {
    snareViz = 1 - (measurePos + 1/8) * 4
  }

  if (measure === 32) {
    beatViz = 0
    snareViz = 0
  }

  let flowAmount = 0
  for (const segment of flowSpeeds[measure]) {
    if (measurePos > segment[0] / 4) {
      flowAmount = 0.1 + segment[1]
    }
  }

  updateViz(
    saturate(beatViz) * musicVolume * kickAmount,
    saturate(snareViz) * musicVolume * snareAmount,
    flowAmount * musicVolume * leadsAmount,
    channelCount
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
    uiTextMaterial.setTexture(finalStateText)
    uiTextMaterial.updateCameraUniforms()

    const model = mat4([
      2, 0, 0, 0,
      0, 2, -0.1, 0,
      0, -0.1, 1, 0,
      0, 0, -20 * (1 - fadeAmount) ** 2 - 10, 1
    ])

    mat4Mult(model, camera.matrix, model)

    uiTextMaterial.setModel(model)
    draw(quad, uiTextMaterial)
  }

  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
}
