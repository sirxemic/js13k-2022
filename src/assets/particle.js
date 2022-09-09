import { Texture } from '../core/graphics/Texture.js'

export let particleTexture

export function generateParticleTexture () {
  const pixels = []
  const size = 1024
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let radius = Math.hypot((x - half) / half, (y - half) / half)
      let value = radius < 0.05 ? 1 : (0.05 / radius)
      value *= Math.exp(-5 * radius * radius)
      value = Math.floor(value * 256)
      pixels.push(
        value,
        value,
        value,
        255
      )
    }
  }

  particleTexture = new Texture({ data: pixels, width: size })
}
