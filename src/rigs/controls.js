export let activeRig

export function setRig (rig) {
  activeRig = rig
}

export let mouseDown = false
export function updateMouseDown (value) {
  mouseDown = value
}

let previousTouches = {}

document.addEventListener('mousedown', e => { mouseDown = true })
document.addEventListener('touchstart', e => {
  for (const touch of e.changedTouches) {
    previousTouches[touch.identifier] = touch
  }
  mouseDown = true
})
document.addEventListener('mouseup', e => { mouseDown = false })
document.addEventListener('touchend', e => {
  for (const touch of e.changedTouches) {
    delete previousTouches[touch.identifier]
  }
  mouseDown = false
})
document.addEventListener('touchmove', e => {
  for (const touch of e.changedTouches) {
    const previousTouch = previousTouches[touch.identifier]
    previousTouches[touch.identifier] = touch
    if (Math.hypot(touch.clientX - previousTouch.clientX, touch.clientY - previousTouch.clientY) > 10) {
      mouseDown = false
    }
  }
})
