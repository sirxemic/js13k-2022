import { generateParticleTexture } from './assets/particle.js'
import { generateNoiseTexture } from './assets/noise.js'
import { loadSkyboxMaterial } from './assets/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/particleMaterial.js'
import { generateSong } from './assets/mainSong.js'
import { generateReverbIR } from './assets/reverbIR.js'
import { generateAudioMix } from './assets/audioMix.js'
import { waitForNextFrame } from './utils.js'
import { generateNoiseSound } from './assets/noiseSound.js'
import { loadFadeMaterial } from './assets/fadeMaterial.js'
import { generateTexts } from './assets/texts.js'
import { loadUiTextMaterial } from './assets/uiTextMaterial.js'

export async function initAssets () {
  loadFadeMaterial()
  loadUiTextMaterial()
  generateTexts()
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
