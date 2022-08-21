import {
  applyEnvelope,
  generateSound,
  sampleNoise,
  sampleSkewedSine,
} from '../../audio/utils.js'
import { EnvelopeSampler } from '../../utils.js'

export function snare () {
  let ampEnvelope = [
    [0, 1, 0.2],
    [0.2, 1, 0.2],
    [1, 0],
  ]

  let mixSampler = new EnvelopeSampler([
    [0, 0, 0.5],
    [0.02, 1, 0.45],
    [0.2, 0]
  ])

  function sampler (x, t) {
    const mix = mixSampler.sample(x)
    const noise = sampleNoise()
    const fundamental = sampleSkewedSine(t * 261.63 / 4 * 3, 0.8)
    return 0.8 * noise * (1 - mix) + fundamental * mix
  }

  return applyEnvelope(generateSound(0.6, sampler), ampEnvelope)
}
