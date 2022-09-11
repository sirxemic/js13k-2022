import { applyEnvelope, createAudioBuffer, generateSound, sampleNoise } from '../../audio/utils.js'

export let reverbIR

export function generateReverbIR () {
  const globalEnvelope = [
    [0, 1, 0.15],
    [1, 0]
  ]

  const buffer1 = applyEnvelope(
    generateSound(4, sampleNoise),
    globalEnvelope
  )

  const buffer2 = applyEnvelope(
    generateSound(4, sampleNoise),
    globalEnvelope
  )

  reverbIR = createAudioBuffer([
    buffer1, buffer2
  ])
}
