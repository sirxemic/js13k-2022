import { distance } from '../math/vec3.js'

const cellSize = 15

export class GridSpace {
  constructor (data) {
    this.grid = new Map()

    for (const point of data) {
      const { position } = point
      const cellKey = `${Math.floor(position[0] / cellSize)}_${Math.floor(position[1] / cellSize)}_${Math.floor(position[2] / cellSize)}`
      this.grid.set(cellKey, this.grid.get(cellKey) || [])
      this.grid.get(cellKey).push(point)
    }
  }

  getClosestPoints (pos, amount) {
    const result = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cellKey = `${Math.floor(pos[0] / cellSize) + dx}_${Math.floor(pos[1] / cellSize) + dy}_${Math.floor(pos[2] / cellSize) + dz}`
          const cell = this.grid.get(cellKey)
          if (!cell) continue

          for (const point of cell) {
            result.push([point, distance(point.spacePosition, pos)])
          }
        }
      }
    }
    return result.sort((a, b) => a[1] - b[1]).slice(0, amount)
  }
}
