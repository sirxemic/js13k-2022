import { Mesh } from '../core/graphics/Mesh.js'
import { Material } from '../core/graphics/Material.js'
import { draw } from '../core/renderer.js'
import { camera } from '../core/camera.js'
import { activeRig } from '../core/globals.js'
import { varyingNormal } from '../core/constants.js'
import { quatMultiply, setFromAxisAngle } from '../math/quat.js'

const cube = new Mesh()
cube.vertexbuffer.vertexData([
  -1, 1, 1,0,0,-1, 0, 0,
  -1,-1,-1,0,0,-1, 0, 0,
  -1,-1, 1,0,0,-1, 0, 0,

  -1, 1,-1,0,0, 0, 0,-1,
   1,-1,-1,0,0, 0, 0,-1,
  -1,-1,-1,0,0, 0, 0,-1,

   1, 1,-1,0,0, 1, 0, 0,
   1,-1, 1,0,0, 1, 0, 0,
   1,-1,-1,0,0, 1, 0, 0,

   1, 1, 1,0,0, 0, 0, 1,
  -1,-1, 1,0,1, 0, 0, 1,
   1,-1, 1,0,0, 0, 0, 1,

   1,-1,-1,0,0, 0,-1, 0,
  -1,-1, 1,0,0, 0,-1, 0,
  -1,-1,-1,0,0, 0,-1, 0,

  -1, 1,-1,0,0, 0, 1, 0,
   1, 1, 1,0,0, 0, 1, 0,
   1, 1,-1,0,0, 0, 1, 0,

  -1, 1, 1,0,0,-1, 0, 0,
  -1, 1,-1,0,0,-1, 0, 0,
  -1,-1,-1,0,0,-1, 0, 0,

  -1, 1,-1,0,0, 0, 0,-1,
   1, 1,-1,0,0, 0, 0,-1,
   1,-1,-1,0,0, 0, 0,-1,

   1, 1,-1,0,0, 1, 0, 0,
   1, 1, 1,0,0, 1, 0, 0,
   1,-1, 1,0,0, 1, 0, 0,

   1, 1, 1,0,0, 0, 0, 1,
  -1, 1, 1,0,1, 0, 0, 1,
  -1,-1, 1,0,1, 0, 0, 1,

   1,-1,-1,0,0, 0,-1, 0,
   1,-1, 1,0,0, 0,-1, 0,
  -1,-1, 1,0,0, 0,-1, 0,

  -1, 1,-1,0,0, 0, 1, 0,
  -1, 1, 1,0,0, 0, 1, 0,
   1, 1, 1,0,0, 0, 1, 0
])

const material = new Material(null, null, `
  vec4 shader() { return vec4(${varyingNormal} * 0.5 + 0.5, 1.0); }
`)
material.setColor([1, 0, 0, 1])

export function updateScene (dt) {
  camera.position[2] += dt
}

export function renderScene () {
  material.setProjection(camera.projectionMatrix)
  material.setView(camera.viewMatrix)

  for (let z = -3; z <= 3; z++) {
    for (let x = -3; x <= 3; x++) {
      for (let y = -2; y <= 2; y++) {
        if (y === 0) continue
        material.setModel(new Float32Array([
          1.0, 0.0, 0.0, 0.0,
          0.0, 1.0, 0.0, 0.0,
          0.0, 0.0, 1.0, 0.0,
          x * 5, z * 5, -y * 5, 1.0
        ]))
        draw(cube, material)
      }
    }
  }
}
