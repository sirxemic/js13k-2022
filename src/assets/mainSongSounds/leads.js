import { applyEnvelope, generateSound, getFrequencyDelta, sampleSkewedSine } from '../../audio/utils.js'

function makeLead (sampler) {
  return function (baseFrequency, duration) {
    let p = 0

    function getSample (x, t) {
      let vibratoAmount = t < 0.7 ? 0 : Math.min((t - 0.7) * 2, 1)
      const amount = 0.004 * vibratoAmount * Math.sin(t * 30)
      const frequency = baseFrequency * Math.pow(2, amount)
      p += getFrequencyDelta(frequency)
      return sampler(p, 0.35)
    }

    duration += 0.1

    const envelope = [
      [0, 0],
      [0.01 / duration, 1],
      [Math.min(0.5, 1 - 0.1 / duration), 0.75, 1],
      [1 - 0.1 / duration, 0.75, 1],
      [1, 0]
    ]

    return applyEnvelope(generateSound(duration, getSample), envelope)
  }
}

export const lead1 = makeLead(sampleSkewedSine)

export const lead2 = makeLead(function (p) {
  let x = Math.sin(p * 2 * Math.PI) * 3
  if (x < -1) x = -1
  if (x > 1) x = 1
  return Math.sin(x * Math.PI * 0.5)
})

lead2.toString = () => 'lead2'
