import { applyEnvelope, generateSound, getFrequencyDelta } from '../../../audio/utils.js'
import { EnvelopeSampler } from '../../../utils.js'

export function kick () {
  let p = 0

  let pitchSampler = new EnvelopeSampler([
    [0, 1580],
    [0.022, 200, 0.05],
    [1, 65.3],
  ], true)

  let ampEnvelope = [
    [0, 0],
    [0.015, 1, 0.5],
    [0.6, 0.4, 0.3],
    [1, 0],
  ]

  function sampler (t) {
    const frequency = pitchSampler.sample(t)
    p += getFrequencyDelta(frequency)

    let x = Math.sin(p * 2 * Math.PI) * 1.1
    if (x < -1) x = -1
    if (x > 1) x = 1
    return Math.sin(x * Math.PI * 0.5)
  }

  return applyEnvelope(generateSound(0.33, sampler), ampEnvelope)
}
