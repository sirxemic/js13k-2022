import { VrLoop } from './core/VrLoop.js'
import { DefaultLoop } from './core/DefaultLoop.js'
import { loading, startButton, startScreen, vrButton } from './ui.js'
import { initAssets } from './initAssets.js'
import { mainSong } from './assets/mainSong.js'
import { audioContext } from './audio/context.js'
import { noiseSound } from './assets/noiseSound.js'
import { setMainScene } from './world/main.js'
import { activeRig } from './rigs/controls.js'

async function start () {
  audioContext.resume()

  await activeRig.startControls()

  mainSong.start()
  noiseSound.start()

  setMainScene()
}

initAssets().then(() => {
  loading.hidden = true

  VrLoop.onEnd = () => {
    DefaultLoop.start()
  }

  vrButton.onclick = async () => {
    DefaultLoop.stop()
    await VrLoop.start()
    await start()
  }

  startButton.onclick = async () => {
    startScreen.hidden = true

    await start()
  }

  DefaultLoop.start()
})
