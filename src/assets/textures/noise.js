import { Texture } from '../../core/graphics/Texture.js'

export let noiseTexture

export function generateNoiseTexture () {
  const size = 2048
  const data = new Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = Math.floor(Math.random() * 256)
    data[i * 4 + 1] = Math.floor(Math.random() * 256)
    data[i * 4 + 2] = Math.floor(Math.random() * 256)
    data[i * 4 + 3] = 255
  }
  noiseTexture = new Texture({ data, width: size })
}
