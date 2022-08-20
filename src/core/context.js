export const canvas = document.querySelector('canvas')

function onResize() {
  canvas.width = window.innerWidth * window.devicePixelRatio
  canvas.height = window.innerHeight * window.devicePixelRatio
}
window.onresize = onResize
onResize()

export const gl = canvas.getContext('webgl2', { 'xrCompatible': true })

gl.enable(gl.DEPTH_TEST)
