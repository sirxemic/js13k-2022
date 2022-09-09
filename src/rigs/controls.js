export let activeRig

export const setRig = (rig) => {
  activeRig = rig
}

export const toggleControls = (active) => {
  if (active) {
    activeRig.startControls()
  } else {
    activeRig.pauseControls()
  }
}

export let mouseDown = false

document.addEventListener('mousedown', e => { mouseDown = true })
document.addEventListener('mouseup', e => { mouseDown = false })
