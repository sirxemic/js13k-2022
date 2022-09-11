import { generateNoiseTexture } from './assets/noise.js'
import { loadSkyboxMaterial } from './assets/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/particleMaterial.js'
import { generateSong } from './assets/mainSong.js'
import { generateReverbIR } from './assets/reverbIR.js'
import { generateAudioMix } from './assets/audioMix.js'
import { updateInitProgress } from './utils.js'
import { generateNoiseSound } from './assets/noiseSound.js'
import { loadFadeMaterial } from './assets/fadeMaterial.js'
import { generateTexts } from './assets/texts.js'
import { loadUiTextMaterial } from './assets/uiTextMaterial.js'
import { generateGalaxy } from './assets/galaxy.js'
import { loadGalaxyMaterial } from './assets/galaxyMaterial.js'

export async function initAssets () {
  // Textures
  await generateTexts()
  await generateGalaxy()

  await updateInitProgress()

  generateNoiseTexture()
  await updateInitProgress()

  // Materials
  loadParticleMaterial()
  loadFadeMaterial()
  loadUiTextMaterial()
  loadGalaxyMaterial()
  loadSkyboxMaterial()

  // Audio
  generateReverbIR()
  await updateInitProgress()
  generateAudioMix()
  await generateSong()
  generateNoiseSound()
  await updateInitProgress()
}
