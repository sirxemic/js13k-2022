import { Texture } from '../core/graphics/Texture.js'

export let particleTexture

export function generateParticleTexture () {
  const pixels = []
  const size = 1024
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = Math.hypot((x - half) / half, (y - half) / half)
      value = Math.floor(Math.exp(-10 * value * value) * 256)
      pixels.push(
        value,
        value,
        value,
        255
      )
    }
  }

  particleTexture = new Texture(pixels, size, size)
}
