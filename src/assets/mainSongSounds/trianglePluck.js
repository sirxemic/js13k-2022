import { applyEnvelope, generateSound, getFrequencyDelta, sampleTriangle } from '../../audio/utils.js'

const trianglePluckEnvelope = [
  [0, 0],
  [0.0045, 1, 0.5],
  [0.17, 0.75, 0.3],
  [1, 0]
]
export function trianglePluck (frequency) {
  let p = 0

  function getSample () {
    p += getFrequencyDelta(frequency)
    return sampleTriangle(p)
  }

  return applyEnvelope(generateSound(1, getSample), trianglePluckEnvelope)
}

