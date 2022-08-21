import { generateParticleTexture } from './assets/particle.js'
import { generateNoiseTexture } from './assets/noise.js'
import { loadSkyboxMaterial } from './assets/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/particleMaterial.js'
import { generateSong } from './assets/mainSong.js'
import { generateReverbIR } from './assets/reverbIR.js'
import { generateAudioMix } from './assets/audioMix.js'
import { waitForNextFrame } from './utils.js'
import { generateNoiseSound } from './assets/noiseSound.js'

export async function initAssets () {
  generateParticleTexture()
  await waitForNextFrame()
  generateNoiseTexture()
  await waitForNextFrame()
  loadParticleMaterial()
  loadSkyboxMaterial()
  generateReverbIR()
  await waitForNextFrame()
  generateAudioMix()
  await generateSong()
  generateNoiseSound()
  await waitForNextFrame()
}
