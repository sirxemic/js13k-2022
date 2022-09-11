import { displacementNoise, getImageDataFromSvgCode, radialGradient, svg } from '../../svg.js'
import { Texture } from '../../core/graphics/Texture.js'
import { gl } from '../../core/context.js'
import { saturate } from '../../math/math.js'

export let galaxyTexture

export async function generateGalaxy () {
  const code = svg(
    1024,
    1024,
    displacementNoise(0.01, 3, 50, 'n'),
    `<defs>${radialGradient([
      [10, '#fff'],
      [40, '#fff8'],
      [80, '#fff2'],
      [100, '#fff0'],
    ], 'g')}</defs>`,
    `<g filter="url(#n)" fill="url(#g)">
      <rect fill="#000" width="1024" height="1024"/>
      <ellipse rx="500" ry="100" cx="512" cy="512"/>
      <ellipse rx="300" ry="200" cx="512" cy="512"/>
    </g>`
  )

  galaxyTexture = new Texture({ data: await getImageDataFromSvgCode(code), wrap: gl.CLAMP_TO_EDGE })
}
