import { applyEnvelope, generateSound, highPassFilter, sampleNoise } from '../../audio/utils.js'

export function hihat (freq, duration, volume) {
  let ampEnvelope = [
    [0, 0],
    [0.015, volume * 0.5, 0.4],
    [1, 0],
  ]

  return applyEnvelope(highPassFilter(generateSound(0.2, sampleNoise), 5000), ampEnvelope)
}

export function sweep (_, duration) {
  let ampEnvelope = [
    [0, 0, 4],
    [1, 0.5],
  ]

  return applyEnvelope(highPassFilter(generateSound(duration, sampleNoise), 5000), ampEnvelope)
}
