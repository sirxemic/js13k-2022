import { Texture } from '../core/graphics/Texture.js'
import { gl } from '../core/context.js'

export let winText
export let loseText

const measureCanvas = document.createElement('canvas')
const measureContext = measureCanvas.getContext('2d')
measureContext.font = '900 100px system-ui'

function measureText (text) {
  return measureContext.measureText(text)
}

export function generateText (text, color) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const lines = text.split('\n')
  const measurements = lines.map(line => measureText(line))
  let maxWidth = 0
  let maxHeight = 0
  for (const measurement of measurements) {
    maxWidth = Math.max(maxWidth, measurement.width)
    maxHeight = Math.max(maxHeight, measurement.actualBoundingBoxDescent + measurement.actualBoundingBoxAscent)
  }

  canvas.width = maxWidth
  canvas.height = maxHeight * lines.length
  ctx.font = measureContext.font
  ctx.fillStyle = color

  let y = 0
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], (maxWidth - measurements[i].width) / 2, y + measurements[i].actualBoundingBoxAscent)

    y += maxHeight
  }

  return {
    texture: new Texture({ data: canvas, wrap: gl.CLAMP_TO_EDGE }),
    ratio: canvas.width / canvas.height
  }
}


export function generateTexts () {
  winText = generateText('Ascended', '#000')
  loseText = generateText('Forever lost\nin limbo', '#fff')
}
