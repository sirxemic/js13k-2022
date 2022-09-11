import { Texture } from '../core/graphics/Texture.js'
import { gl } from '../core/context.js'
import { getImageDataFromSvgCode, svg, text as svgText } from '../svg.js'

export let winText
export let loseText

export async function generateText (text, color) {
  const lines = text.split('\n')
  const svgLines = lines.map((line, i) => svgText(line, color, 512, 512 - lines.length * 50 + i * 100))
  const code = svg(
    1024,
    1024,
    ...svgLines
  )

  return new Texture({ data: await getImageDataFromSvgCode(code), wrap: gl.CLAMP_TO_EDGE })
}

export async function generateTexts () {
  winText = await generateText('Ascended', '#000')
  loseText = await generateText('Forever lost\nin limbo', '#fff')
}
