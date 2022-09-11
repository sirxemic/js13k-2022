import { applyEnvelope, generateSound, sampleNoise } from '../../../audio/utils.js'

export function hihat (freq, duration, volume) {
  let ampEnvelope = [
    [0, 0],
    [0.015, volume * 0.5, 0.4],
    [1, 0],
  ]

  return applyEnvelope(generateSound(0.2, sampleNoise), ampEnvelope)
}

export function sweep (_, duration) {
  let ampEnvelope = [
    [0, 0, 4],
    [1, 0.5],
  ]

  return applyEnvelope(generateSound(duration, sampleNoise), ampEnvelope)
}
