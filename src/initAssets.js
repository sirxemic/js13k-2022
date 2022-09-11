import { generateNoiseTexture } from './assets/textures/noise.js'
import { loadSkyboxMaterial } from './assets/materials/skyboxMaterial.js'
import { loadParticleMaterial } from './assets/materials/particleMaterial.js'
import { generateSong } from './assets/audio/mainSong.js'
import { generateReverbIR } from './assets/audio/reverbIR.js'
import { generateAudioMix } from './assets/audioMix.js'
import { updateInitProgress } from './utils.js'
import { generateNoiseSound } from './assets/audio/noiseSound.js'
import { loadFadeMaterial } from './assets/materials/fadeMaterial.js'
import { generateTexts } from './assets/textures/texts.js'
import { loadUiTextMaterial } from './assets/materials/uiTextMaterial.js'
import { generateGalaxy } from './assets/textures/galaxy.js'
import { loadGalaxyMaterial } from './assets/materials/galaxyMaterial.js'
import { loadGoalMaterial } from './assets/materials/goalMaterial.js'

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
  loadGoalMaterial()

  // Audio
  generateReverbIR()
  await updateInitProgress()
  generateAudioMix()
  await generateSong()
  generateNoiseSound()
  await updateInitProgress()
}
