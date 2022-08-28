import { head } from '../core/camera.js'
import { audioMix } from '../assets/audioMix.js'
import {
  currentTime,
  focus,
  resetPosition,
  updateFocus,
  updateLifeAmount,
  updateParticles,
  updateTime,
  updateTrack
} from './world.js'
import { mainTrack } from './track.js'
import { distance } from '../math/vec3.js'
import { VIEW_DISTANCE } from '../constants.js'

let state = 0
let drifting = false
let fade = 0

export function setMainScene () {
  state = 1
  updateTrack(mainTrack)

  resetPosition()
}

export function updateScene (dt) {
  if (distance(head.position, focus) < VIEW_DISTANCE) {
    updateFocus(dt)
  }

  updateParticles(dt)

  if (state === 0) {
    introUpdate(dt)
  } else {
    mainUpdate(dt)
  }
}

let followDuration = 0

export function introUpdate (dt) {
  if (head.position[0] > 100) {
    resetPosition()
  }
}

export function mainUpdate (dt) {
  updateTime(dt)

  const dist = distance(head.position, focus)
  let musicVolume = Math.min(1, Math.max(0, (20 - (dist - 10)) / 10))
  let noiseVolume = Math.min(1, Math.max(0, (dist - 20) / 15))

  if (dist < VIEW_DISTANCE) {
    followDuration += dt
    drifting = false
  } else {
    drifting = true
  }

  if (drifting) {
    fade += dt / 3
  } else {
    fade = 0
  }

  const measurePos = (currentTime % 1.6) / 1.6
  let beatViz = 0.1
  if (measurePos < 0.25) {
    beatViz += (0.25 - measurePos) * 4
  } else if (measurePos > 5/8 && measurePos < 7/8) {
    beatViz += (7/8 - measurePos) * 4
  }

  updateLifeAmount((1 - fade) * beatViz)

  audioMix.setMusicAmount(followDuration)
  audioMix.setMusicVolume(musicVolume)
  audioMix.setFxVolume(noiseVolume)
}
