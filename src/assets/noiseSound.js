import { audioContext, createBiquadFilter, createGain } from '../audio/context.js'
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

      const mix = createGain()
      const filter1 = createBiquadFilter('lowpass', 80)
      noiseNode.connect(filter1).connect(mix)
      const filter2 = createBiquadFilter('bandpass', 3000)
      const gain2 = createGain(0.002)
      noiseNode.connect(filter2).connect(gain2).connect(mix)


      noiseNode.start()

      audioMix.addFxChannel(mix)
    }
  }
}
