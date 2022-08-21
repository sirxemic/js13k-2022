import {
  applyEnvelope,
  generateSound,
  getFrequencyDelta,
  sampleSkewedSine,
  sumSounds
} from '../../audio/utils.js'

let switchLeftRight = false
export function detuned (frequency, duration) {
  let p = 0

  function getSample () {
    p += getFrequencyDelta(frequency)
    return sampleSkewedSine(p, 0.5)
  }

  const envelope = [
    [0, 0],
    [0.01 / duration, 1],
    [Math.min(0.5, 1 - 0.01 / duration), 0.75, 1],
    [1 - 0.01 / duration, 0.75, 1],
    [1, 0]
  ]

  const mid = generateSound(duration, getSample)
  frequency *= 0.98566
  let left = generateSound(duration, getSample)
  frequency *= 1.02930
  let right = generateSound(duration, getSample)

  if (switchLeftRight) {
    [left, right] = [right, left]
  }
  switchLeftRight = !switchLeftRight

  return [
    applyEnvelope(
      sumSounds([
        mid,
        left
      ], [0.8, 0.4]),
      envelope
    ),
    applyEnvelope(
      sumSounds([
        mid,
        right
      ], [0.8, 0.4]),
      envelope
    ),
  ]
}

