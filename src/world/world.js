import { draw } from '../core/renderer.js'
import { camera, head } from '../core/camera.js'
import { gl } from '../core/context.js'
import { skyboxMaterial } from '../assets/skyboxMaterial.js'
import { skyGeometry } from '../assets/skyGeometry.js'
import { VertexBuffer } from '../core/graphics/VertexBuffer.js'
import { particleMaterial } from '../assets/particleMaterial.js'
import { mat4, setRotMatFromQuat } from '../math/mat4.js'
import { addScaled, distance, length, subtract, vec3, vec3Lerp, vec3Normalize } from '../math/vec3.js'
import {
  uniformColor,
  uniformFocusAmount,
  uniformFocusPosition,
  uniformKick,
  uniformSnare,
  uniformTime
} from '../core/constants.js'
import { startTrack } from './track.js'
import { Material } from '../core/graphics/Material.js'
import { FLOW_RADIUS, PARTICLE_SPEED, STRONG_FLOW_RADIUS, VIEW_DISTANCE } from '../constants.js'
import { getRandomBrightColor, getRandomDirection } from '../utils.js'
import { saturate } from '../math/math.js'
import { deltaTime } from '../core/core.js'
import { galaxyMaterial } from '../assets/galaxyMaterial.js'
import { quad } from '../assets/quad.js'
import { quat, quatMultiply, setFromAxisAngle, setFromUnitVectors } from '../math/quat.js'

export let currentTime = 0
export let kickVizAmount = 0
export let snareVizAmount = 0
export let currentTrack = startTrack
export let focus = vec3()
export let progress = 0

const galaxies = Array.from({ length: 50 }, () => {
  const position = getRandomDirection()
  const rotation = setFromAxisAngle(quat(), [0, 0, 1], Math.random() * Math.PI)
  const placement = setFromUnitVectors(quat(), [0, 0, 1], vec3Normalize(position))
  const size = 5 + Math.random() * 20

  quatMultiply(rotation, placement, rotation)
  const model = setRotMatFromQuat(mat4(), rotation)
  for (let i = 0; i < 12; i++) {
    model[i] *= size
  }
  model[12] = position[0] * 50
  model[13] = position[1] * 50
  model[14] = position[2] * 50
  return [model, vec3([...getRandomBrightColor(), 1.0])]
})

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
export function updateTime () {
  currentTime += deltaTime
}
export function updateViz (kick, snare) {
  kickVizAmount = kick
  snareVizAmount = snare
}
export function updateFocus () {
  const data = currentTrack.getDistanceAndDirection(head.position)
  if (data[1]) {
    vec3Lerp(focus, focus, data[1], (1 - Math.exp(-10 * deltaTime)))
  }
  progress = data[3] * 100
}

const particlesCount = 1000

const particleStructSize = 8

const particleRenderData = new Float32Array(particlesCount * particleStructSize)
const particleStateData = new Float32Array(particlesCount * 4)
for (let i = 0; i < particlesCount; i++) {
  particleRenderData.set([
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    (Math.random() - 0.5) * 2 * VIEW_DISTANCE,
    0,
    i % 2 === 0,
    ...getRandomBrightColor()
  ], i * particleStructSize)
}
const particles = new VertexBuffer(gl.POINTS)
particles.vertexLayout([3, 2, 3])
particles.vertexData(particleRenderData)

export function resetPosition () {
  const diff = vec3(head.position)

  for (let i = 0; i < particlesCount; i++) {
    const pos = particleRenderData.subarray(i * particleStructSize, i * particleStructSize + 3)
    subtract(pos, pos, diff)
  }

  subtract(head.position, head.position, diff)

  particles.updateVertexData(particleRenderData)

  focus = currentTrack.getDistanceAndDirection(head.position)[1]
}

export function updateParticles () {
  for (let i = 0; i < particlesCount; i++) {
    const pos = particleRenderData.subarray(i * particleStructSize, i * particleStructSize + 3)
    const props = particleRenderData.subarray(i * particleStructSize + 3, i * particleStructSize + 6)
    const [dist, _, newDir] = currentTrack.getDistanceAndDirection(pos)
    const factor = saturate(1 - (dist - STRONG_FLOW_RADIUS) / FLOW_RADIUS)
    const speed = PARTICLE_SPEED * factor * factor

    const dir = particleStateData.subarray(i * 4, i * 4 + 3)

    if (length(dir) === 0) {
      dir.set(newDir)
    } else {
      vec3Lerp(dir, dir, newDir, 1 - Math.exp(-deltaTime * 5))
    }

    addScaled(pos, pos, dir, 3 * speed * deltaTime)

    props[0] = factor * 5

    if (factor < 0.001) {
      particleStateData[i * 4 + 3] += deltaTime
    } else {
      particleStateData[i * 4 + 3] = 0
    }

    if (distance(pos, focus) > VIEW_DISTANCE * 1.5 || particleStateData[i * 4 + 3] > 1) {
      const offset = getRandomDirection()
      vec3Normalize(offset)

      addScaled(pos, head.position, offset, VIEW_DISTANCE)

      const dir = currentTrack.getDistanceAndDirection(pos)[2]

      particleStateData[i * 4 + 0] = dir[0]
      particleStateData[i * 4 + 1] = dir[1]
      particleStateData[i * 4 + 2] = dir[2]
      particleStateData[i * 4 + 3] = 0
    }
  }

  particles.updateVertexData(particleRenderData)
}

export function renderWorld () {
  const dist = distance(head.position, focus)

  const FADE_START = FLOW_RADIUS
  const FADE_RANGE = VIEW_DISTANCE - FLOW_RADIUS

  const focusAmount = saturate(1 - (dist - FADE_START) / (FADE_RANGE / 2))

  gl.depthMask(false)
  skyboxMaterial.updateCameraUniforms()
  skyboxMaterial.setModel(mat4([
    -500.0, 0.0, 0.0, 0.0,
    0.0, -500.0, 0.0, 0.0,
    0.0, 0.0, -500.0, 0.0,
    ...camera.matrix.slice(12, 15), 1.0
  ]))
  skyboxMaterial.shader.set1f(uniformTime, currentTime)
  skyboxMaterial.shader.set1f(uniformKick, kickVizAmount)
  skyboxMaterial.shader.set1f(uniformSnare, snareVizAmount)
  skyboxMaterial.shader.set1f(uniformFocusAmount, focusAmount)
  draw(skyGeometry, skyboxMaterial)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.disable(gl.DEPTH_TEST)
  gl.depthMask(false)

  galaxyMaterial.updateCameraUniforms()

  for (let i = 0; i < galaxies.length; i++) {
    const [galaxyModel, color] = galaxies[i]
    const model = mat4(galaxyModel)
    model[12] += camera.matrix[12]
    model[13] += camera.matrix[13]
    model[14] += camera.matrix[14]

    galaxyMaterial.setModel(model)
    galaxyMaterial.shader.set1f(uniformKick, kickVizAmount)
    galaxyMaterial.shader.set1f(uniformSnare, snareVizAmount)
    galaxyMaterial.shader.set4fv(uniformColor, color)
    galaxyMaterial.shader.set1f(uniformFocusAmount, focusAmount)
    galaxyMaterial.shader.set1f(uniformTime, 0.2 * currentTime)
    draw(quad, galaxyMaterial)
  }

  particleMaterial.updateCameraUniforms()
  particleMaterial.setModel(mat4())
  particleMaterial.shader.set3fv(uniformFocusPosition, focus)
  particleMaterial.shader.set1f(uniformKick, kickVizAmount)
  particleMaterial.shader.set1f(uniformSnare, snareVizAmount)
  draw(particles, particleMaterial)
  gl.depthMask(true)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)

  // <debug>
  // trackMaterial.updateCameraUniforms()
  // trackMaterial.setModel(mat4())
  // draw(trackMesh, trackMaterial)
  // </debug>
}
