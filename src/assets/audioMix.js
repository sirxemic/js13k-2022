import { audioContext, audioDestination, createGain } from '../audio/context.js'
import { reverbIR } from './audio/reverbIR.js'
import { saturate } from '../math/math.js'

export let audioMix

export function generateAudioMix () {
  const musicGain = createGain()

  const fxGain = createGain(0)

  const reverbNode = audioContext.createConvolver()
  reverbNode.buffer = reverbIR

  fxGain.connect(audioDestination)
  reverbNode.connect(musicGain).connect(audioDestination)

  const channels = []

  audioMix = {
    addMusicChannel (fadeMin, fadeMax, node, volume, reverbSend) {
      const controller = createGain(fadeMax ? 0.00001 : 1)
      const channelGain = createGain(volume)
      const sendControl = createGain(reverbSend)

      node.connect(channelGain).connect(controller).connect(musicGain)
      controller.connect(sendControl).connect(reverbNode)

      channels.push({
        fadeMin,
        fadeMax,
        controller
      })
    },

    addFxChannel (node) {
      node.connect(fxGain)
    },

    setMusicVolume (volume) {
      musicGain.gain.setValueAtTime(Math.sqrt(volume), audioContext.currentTime)
    },

    setFxVolume (volume) {
      fxGain.gain.setValueAtTime(Math.sqrt(volume), audioContext.currentTime)
    },

    setMusicProgress (amount) {
      for (const channel of channels) {
        const mix = saturate((amount - channel.fadeMin) / (channel.fadeMax - channel.fadeMin))
        channel.controller.gain.setValueAtTime(0.00001 * (100000 ** mix), audioContext.currentTime)
      }
    },

    setMusicEnd (amount) {
      for (let i = 0; i < channels.length; i++) {
        const mix = saturate(1 + i - amount)
        channels[i].controller.gain.setValueAtTime(0.00001 * (100000 ** mix), audioContext.currentTime)
      }
    }
  }
}
