import { applyEnvelope, createAudioBuffer, generateSound, sampleNoise } from '../audio/utils.js'

export let reverbIR

export function generateReverbIR () {
  function createNoisyEnvelope () {
    let t = 0
    let result = []
    do {
      result.push([t, Math.random()])

      t += 0.005
    } while (t <= 1)

    return result
  }
  const volumeEnvelope1 = createNoisyEnvelope()
  const volumeEnvelope2 = createNoisyEnvelope()

  const globalEnvelope = [
    [0, 0, 2],
    [0.02, 1, 0.25],
    [1, 0]
  ]

  const buffer1 = applyEnvelope(
    applyEnvelope(
      generateSound(4, sampleNoise),
      volumeEnvelope1
    ),
    globalEnvelope
  )

  const buffer2 = applyEnvelope(
    applyEnvelope(
      generateSound(4, sampleNoise),
      volumeEnvelope2
    ),
    globalEnvelope
  )

  reverbIR = createAudioBuffer([
    buffer1, buffer2
  ])
}
