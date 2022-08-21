import { audioContext, createBiquadFilter } from '../audio/context.js'
import { sampleNoise } from '../audio/utils.js'
import { audioMix } from './audioMix.js'

export let noiseSound

export function generateNoiseSound () {
  const noiseBuffer = audioContext.createBuffer(2, 6 * audioContext.sampleRate, audioContext.sampleRate)
  const samples1 = noiseBuffer.getChannelData(0)
  const samples2 = noiseBuffer.getChannelData(1)
  for (let i = 0; i < samples1.length; i++) {
    samples1[i] = sampleNoise()
    samples2[i] = sampleNoise()
  }

  noiseSound = {
    start () {
      const noiseNode = audioContext.createBufferSource()
      noiseNode.buffer = noiseBuffer
      noiseNode.loop = true
      noiseNode.loopEnd = noiseBuffer.length

      const filter1 = createBiquadFilter('highshelf', 500, undefined, -12)
      const filter2 = createBiquadFilter('lowpass', 500)
      const filter3 = createBiquadFilter('peaking', 170, undefined -10)

      noiseNode.connect(filter1).connect(filter2).connect(filter3)

      noiseNode.start()

      audioMix.addFxChannel(filter3)
    }
  }
}
