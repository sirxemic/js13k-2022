import { VrLoop } from './core/VrLoop.js'
import { DefaultLoop } from './core/DefaultLoop.js'
import { startButton, vrButton, startScreen } from './ui.js'
import { desktopRig } from './rigs/DesktopRig.js'
import { initAssets } from './initAssets.js'
import { mainSong } from './assets/mainSong.js'
import { audioContext } from './audio/context.js'
import { noiseSound } from './assets/noiseSound.js'
import { setMainScene } from './world/main.js'

function start () {
  audioContext.resume()
  mainSong.start()
  noiseSound.start()
  setMainScene()
}

initAssets().then(() => {
  VrLoop.onEnd = () => {
    DefaultLoop.start()
  }

  vrButton.onclick = () => {
    DefaultLoop.stop()
    VrLoop.start()

    start()
  }

  startButton.onclick = () => {
    startScreen.hidden = true
    desktopRig.startControls()

    start()
  }

  DefaultLoop.start()
})
