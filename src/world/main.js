import { head } from '../core/camera.js'
import { audioMix } from '../assets/audioMix.js'
import { currentTrack, resetPosition, updateParticles, updateTrack } from './world.js'
import { mainTrack } from './track.js'

let state = 0

export function setMainScene () {
  state = 1
  updateTrack(mainTrack)

  resetPosition()
}

export function updateScene (dt) {
  updateParticles(dt)

  if (state == 0) {
    introUpdate(dt)
  } else {
    mainUpdate(dt)
  }
}

let followDuration = 0

export function introUpdate (dt) {
  // resetPosition()
}

export function mainUpdate (dt) {
  const [dist, dir] = currentTrack.getDistanceAndDirection(head.position)
  let musicVolume = Math.min(1, Math.max(0, (15 - (dist - 5)) / 15))
  let noiseVolume = Math.min(1, Math.max(0, (dist - 20) / 15))

  if (musicVolume > 0.9) {
    followDuration += dt
  }

  audioMix.setMusicAmount(followDuration)
  audioMix.setMusicVolume(musicVolume)
  audioMix.setFxVolume(noiseVolume)
}
