import { audioContext, audioDestination } from '../audio/context.js'
import { reverbIR } from './reverbIR.js'

export let audioMix

export function generateAudioMix () {
  const reverbNode = audioContext.createConvolver()
  reverbNode.buffer = reverbIR

  reverbNode.connect(audioDestination)

  audioMix = {
    addChannel (node, volume, reverbSend) {
      const generalGain = audioContext.createGain()
      generalGain.gain.value = volume

      const sendControl = audioContext.createGain()
      sendControl.gain.value = reverbSend

      // Node -> GeneralGain -> Destination
      //                    \-> SendControl -> Reverb -> Destination
      //

      node.connect(generalGain)
      generalGain.connect(audioDestination)
      generalGain.connect(sendControl)
      sendControl.connect(reverbNode)
    }
  }
}
