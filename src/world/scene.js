import { draw } from '../core/renderer.js'
import { camera, head } from '../core/camera.js'
import { gl } from '../core/context.js'
import { skyboxMaterial } from '../assets/skyboxMaterial.js'
import { cube } from '../assets/cube.js'
import { VertexBuffer } from '../core/graphics/VertexBuffer.js'
import { particleMaterial } from '../assets/particleMaterial.js'
import { mat4 } from '../math/mat4.js'
import { addScaled, distance, vec3Normalize, length } from '../math/vec3.js'
import { uniformLife } from '../core/constants.js'
import { mainTrack, startTrack } from './track.js'
import { Material } from '../core/graphics/Material.js'

// <debug>
const trackMesh = new VertexBuffer(gl.LINE_STRIP)
trackMesh.vertexLayout([3])
trackMesh.vertexData(mainTrack.getPointsData())

const trackMaterial = new Material(`
vec4 shader () { return vec4(1.0); }
`)
// </debug>


const particlesCount = 1000

const particleStructSize = 7

const particlesData = new Float32Array(particlesCount * particleStructSize)
for (let i = 0; i < particlesCount; i++) {
  particlesData.set([
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    0,
    0.5 + 0.5 * Math.random(),
    0.5 + 0.5 * Math.random(),
    0.5 + 0.5 * Math.random()
  ], i * particleStructSize)
}
const particles = new VertexBuffer(gl.POINTS)
particles.vertexLayout([3, 1, 3])
particles.vertexData(particlesData)

let life = 0

export function updateScene (dt) {
  for (let i = 0; i < particlesCount; i++) {
    const pos = particlesData.subarray(i * particleStructSize, i * particleStructSize + 4)
    const dir = mainTrack.getDirection(pos)
    addScaled(pos, pos, dir, 20 * dt)
    pos[3] = 20 * length(dir) / 5
    if (distance(pos, head.position) > 51) {
      const dir = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]
      vec3Normalize(dir)
      particlesData[i * particleStructSize + 0] = head.position[0] + dir[0] * 50
      particlesData[i * particleStructSize + 1] = head.position[1] + dir[1] * 50
      particlesData[i * particleStructSize + 2] = head.position[2] + dir[2] * 50
    }
  }

  particles.updateVertexData(particlesData)
}

export function renderScene () {
  gl.depthMask(false)
  skyboxMaterial.updateCameraUniforms()
  skyboxMaterial.setModel(new Float32Array([
    -10.0, 0.0, 0.0, 0.0,
    0.0, -10.0, 0.0, 0.0,
    0.0, 0.0, -10.0, 0.0,
    ...camera.matrix.slice(12)
  ]))
  skyboxMaterial.shader.set1f(uniformLife, life)
  draw(cube, skyboxMaterial)

  gl.enable(gl.BLEND)
  gl.disable(gl.DEPTH_TEST)
  gl.depthMask(false)
  gl.blendFunc(gl.ONE, gl.ONE)
  particleMaterial.updateCameraUniforms()
  particleMaterial.setModel(mat4())
  particleMaterial.shader.set1f(uniformLife, life)
  draw(particles, particleMaterial)
  gl.disable(gl.BLEND)
  gl.enable(gl.DEPTH_TEST)
  gl.depthMask(true)

  // <debug>
  trackMaterial.updateCameraUniforms()
  trackMaterial.setModel(mat4())
  draw(trackMesh, trackMaterial)
  // </debug>
}
