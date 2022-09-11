import { contextSampleRate } from '../../../audio/context.js'
import { applyEnvelope, detune, generateSound, getFrequencyDelta, sampleNoise, sampleSine } from '../../../audio/utils.js'

export function chords (frequency, length) {
  const volumeEnvelope = [
    [0, 0],
    [0.01 / length, 0.5],
    [1 - 0.01 / length, 0.5 - 0.5 * length * 0.2],
    [1, 0]
  ]

  let p1 = Math.random()
  let p2 = Math.random()
  let p3 = Math.random()
  let pN = Math.random()
  let prevY = 0
  let lastNoiseSample = sampleNoise()
  const yAlpha = 1 - Math.exp(-100 / contextSampleRate)

  let f1L = detune(frequency, -10)
  let f2L = detune(frequency, 6)
  let f1R = detune(frequency, 10)
  let f2R = detune(frequency, -6)

  const getSample = (f1, f2) => () => {
    p1 += getFrequencyDelta(f1)
    p2 += getFrequencyDelta(f2)
    p3 += getFrequencyDelta(frequency)
    pN += getFrequencyDelta(frequency * 0.25)
    if (pN >= 1) {
      pN -= 1
      lastNoiseSample = sampleNoise()
    }
    prevY = yAlpha * lastNoiseSample + (1 - yAlpha) * prevY
    return sampleSine(p1) + sampleSine(p2 * 2) * 0.25 + sampleSine(p3 * 4) * prevY
  }

  return [
    applyEnvelope(generateSound(length, getSample(f1L, f2L)), volumeEnvelope),
    applyEnvelope(generateSound(length, getSample(f1R, f2R)), volumeEnvelope)
  ]
}
