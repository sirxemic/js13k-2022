import { draw } from '../core/renderer.js'
import { camera, head } from '../core/camera.js'
import { gl } from '../core/context.js'
import { skyboxMaterial } from '../assets/skyboxMaterial.js'
import { cube } from '../assets/cube.js'
import { VertexBuffer } from '../core/graphics/VertexBuffer.js'
import { particleMaterial } from '../assets/particleMaterial.js'
import { mat4 } from '../math/mat4.js'
import { addScaled, distance, vec3Normalize } from '../math/vec3.js'
import { uniformLife, uniformTime } from '../core/constants.js'
import { startTrack } from './track.js'
import { Material } from '../core/graphics/Material.js'
import { FLOW_RADIUS, STRONG_FLOW_RADIUS, VIEW_DISTANCE } from '../constants.js'

export let currentTime = 0
export let currentLifeAmount = 0
export let currentTrack = startTrack

// <debug>
const trackMesh = new VertexBuffer(gl.LINE_STRIP)
trackMesh.vertexLayout([3])
trackMesh.vertexData(currentTrack.getPointsData())

const trackMaterial = new Material(`
vec4 shader () { return vec4(1.0); }
`)
// </debug>

export function updateTrack (track) {
  currentTrack = track
  // <debug>
  trackMesh.vertexData(currentTrack.getPointsData())
  // </debug>
}
export function updateTime (dt) {
  currentTime += dt
}
export function updateLifeAmount (amount) {
  currentLifeAmount = amount
}

const particlesCount = 1000

const particleStructSize = 7

const particlesData = new Float32Array(particlesCount * particleStructSize)
const particleLifeData = []
for (let i = 0; i < particlesCount; i++) {
  particlesData.set([
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    0,
    0.5 + 0.5 * Math.random(),
    0.5 + 0.5 * Math.random(),
    0.5 + 0.5 * Math.random()
  ], i * particleStructSize)

  particleLifeData.push(0)
}
const particles = new VertexBuffer(gl.POINTS)
particles.vertexLayout([3, 1, 3])
particles.vertexData(particlesData)

export function resetPosition () {
  for (let i = 0; i < particlesCount; i++) {
    particlesData[i * particleStructSize + 0] -= head.position[0]
    particlesData[i * particleStructSize + 1] -= head.position[1]
    particlesData[i * particleStructSize + 2] -= head.position[2]
  }

  particles.updateVertexData(particlesData)

  head.position[0] = 0
  head.position[1] = 0
  head.position[2] = 0
}

export function updateParticles (dt) {
  for (let i = 0; i < particlesCount; i++) {
    const pos = particlesData.subarray(i * particleStructSize, i * particleStructSize + 4)
    const [dist, dir] = currentTrack.getDistanceAndDirection(pos)
    const factor = dist < STRONG_FLOW_RADIUS ? 1 : Math.max(0, (FLOW_RADIUS + STRONG_FLOW_RADIUS - dist) / FLOW_RADIUS)
    const speed = 15 * factor
    addScaled(pos, pos, dir, 3 * speed * dt)
    pos[3] = Math.max(0, Math.min(3, 3 * factor))

    if (factor < 0.001) {
      particleLifeData[i] += dt
    } else {
      particleLifeData[i] = 0
    }

    if (distance(pos, head.position) > VIEW_DISTANCE || particleLifeData[i] > 1) {
      const dir = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
      vec3Normalize(dir)
      particlesData[i * particleStructSize + 0] = head.position[0] + dir[0] * VIEW_DISTANCE
      particlesData[i * particleStructSize + 1] = head.position[1] + dir[1] * VIEW_DISTANCE
      particlesData[i * particleStructSize + 2] = head.position[2] + dir[2] * VIEW_DISTANCE
      particleLifeData[i] = 0
    }
  }

  particles.updateVertexData(particlesData)
}

export function renderWorld () {
  gl.depthMask(false)
  skyboxMaterial.updateCameraUniforms()
  skyboxMaterial.setModel(new Float32Array([
    -10.0, 0.0, 0.0, 0.0,
    0.0, -10.0, 0.0, 0.0,
    0.0, 0.0, -10.0, 0.0,
    ...camera.matrix.slice(12)
  ]))
  skyboxMaterial.shader.set1f(uniformTime, currentTime)
  skyboxMaterial.shader.set1f(uniformLife, currentLifeAmount)
  draw(cube, skyboxMaterial)

  gl.enable(gl.BLEND)
  gl.disable(gl.DEPTH_TEST)
  gl.depthMask(false)
  gl.blendFunc(gl.ONE, gl.ONE)
  particleMaterial.updateCameraUniforms()
  particleMaterial.setModel(mat4())
  particleMaterial.shader.set1f(uniformLife, currentLifeAmount)
  draw(particles, particleMaterial)
  gl.disable(gl.BLEND)
  gl.enable(gl.DEPTH_TEST)
  gl.depthMask(true)

  // <debug>
  // trackMaterial.updateCameraUniforms()
  // trackMaterial.setModel(mat4())
  // draw(trackMesh, trackMaterial)
  // </debug>
}
