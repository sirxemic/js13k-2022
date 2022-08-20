import { VrLoop } from './core/VrLoop.js'
import { DefaultLoop } from './core/DefaultLoop.js'
import { startButton, vrButton, startScreen } from './ui.js'
import { desktopRig } from './rigs/DesktopRig.js'
import { initAssets } from './initAssets.js'

initAssets().then(() => {
  VrLoop.onEnd = () => {
    DefaultLoop.start()
  }

  vrButton.onclick = () => {
    DefaultLoop.stop()
    VrLoop.start()
  }

  startButton.onclick = () => {
    startScreen.hidden = true

    desktopRig.startControls()
  }

  DefaultLoop.start()
})
