import { audioContext, audioDestination, createGain } from '../audio/context.js'
import { reverbIR } from './reverbIR.js'

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
    addMusicChannel (minimum, node, volume, reverbSend) {
      const controller = createGain(minimum ? 0.00001 : 1)
      const channelGain = createGain(volume)
      const sendControl = createGain(reverbSend)

      node.connect(channelGain).connect(controller).connect(musicGain)
      controller.connect(sendControl).connect(reverbNode)

      channels.push({
        minimum,
        muted: minimum, // !!minimum
        controller
      })
    },

    addFxChannel (node) {
      node.connect(fxGain)
    },

    setMusicVolume (volume) {
      musicGain.gain.value = volume
    },

    setFxVolume (volume) {
      fxGain.gain.value = volume
    },

    setMusicAmount (amount) {
      for (const channel of channels) {
        if (channel.muted && channel.minimum < amount) {
          channel.muted = false
          channel.controller.gain.setValueAtTime(0.00001, audioContext.currentTime)
          channel.controller.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 10)
        }
      }
    }
  }
}
