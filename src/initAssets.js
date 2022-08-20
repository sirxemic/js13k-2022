import { generateParticleTexture } from './assets/particle.js'
import { generateNoiseTexture } from './assets/noise.js'
import { loadSkyboxMaterial } from './assets/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/particleMaterial.js'

export async function initAssets () {
  generateParticleTexture()
  generateNoiseTexture()
  loadParticleMaterial()
  loadSkyboxMaterial()
}
