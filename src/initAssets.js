import { generateParticleTexture } from './assets/particle.js'
import { generateNoiseTexture } from './assets/noise.js'
import { loadSkyboxMaterial } from './assets/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/particleMaterial.js'
import { generateSong } from './assets/mainSong.js'
import { generateReverbIR } from './assets/reverbIR.js'
import { generateAudioMix } from './assets/audioMix.js'

export async function initAssets () {
  generateParticleTexture()
  generateNoiseTexture()
  loadParticleMaterial()
  loadSkyboxMaterial()
  generateReverbIR()
  generateAudioMix()
  generateSong()
}
