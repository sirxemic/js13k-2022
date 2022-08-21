import { VrLoop } from './core/VrLoop.js'
import { DefaultLoop } from './core/DefaultLoop.js'
import { startButton, vrButton, startScreen } from './ui.js'
import { desktopRig } from './rigs/DesktopRig.js'
import { initAssets } from './initAssets.js'
import { mainSong } from './assets/mainSong.js'
import { audioContext } from './audio/context.js'

initAssets().then(() => {
  VrLoop.onEnd = () => {
    DefaultLoop.start()
  }

  vrButton.onclick = () => {
    DefaultLoop.stop()
    VrLoop.start()
    mainSong.start()
  }

  startButton.onclick = () => {
    startScreen.hidden = true
    audioContext.resume()
    mainSong.start()

    desktopRig.startControls()
  }

  DefaultLoop.start()
})
