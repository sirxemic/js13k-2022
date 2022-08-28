import { Texture } from '../core/graphics/Texture.js'

export function generateGalaxyTexture () {
  const svg = 'TODO'
  return svgToTexture(svg)
}

function createSvg (width, height, body) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
}

function svgToTexture (svg) {
  const canvas = document.createElement('canvas')
  canvas.width = svg.width
  canvas.height = svg.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(svg, 0, 0)
  return new Texture({ data: canvas })
}
