import { audioContext, audioDestination, createGain } from '../audio/context.js'
import { reverbIR } from './reverbIR.js'

export let audioMix

export function generateAudioMix () {
  const musicGain = createGain()

  const fxGain = createGain()

  const reverbNode = audioContext.createConvolver()
  reverbNode.buffer = reverbIR

  fxGain.connect(audioDestination)
  reverbNode.connect(musicGain).connect(audioDestination)

  function setMix (mix) {
    musicGain.gain.value = Math.sqrt(1 - mix)
    fxGain.gain.value = Math.sqrt(mix)
  }

  setMix(0)

  audioMix = {
    addMusicChannel (node, volume, reverbSend) {
      const generalGain = createGain(volume)
      const sendControl = createGain(reverbSend)

      node.connect(generalGain).connect(musicGain)
      generalGain.connect(sendControl).connect(reverbNode)
    },

    addFxChannel (node) {
      node.connect(fxGain)
    },

    setMix
  }
}
