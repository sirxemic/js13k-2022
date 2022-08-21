import {
  add,
  addScaled,
  distance,
  dot,
  length,
  perpendicularDistance,
  scale,
  subtract,
  vec3,
  vec3Lerp,
  vec3Normalize
} from '../math/vec3.js'

class Track {
  constructor () {
    this.grid = {}
    this.points = []
  }

  addPoint (point) {
    const i = this.points.push(point) - 1

    const cellKey = `${Math.floor(point[0] / 15)}_${Math.floor(point[1] / 15)}_${Math.floor(point[2] / 15)}`
    this.grid[cellKey] = this.grid[cellKey] || []
    this.grid[cellKey].push(i)
  }

  getPointsData () {
    const result = []
    for (const point of this.points) {
      result.push(
        point[0],
        point[1],
        point[2]
      )
    }
    return result
  }

  getDirection (pos) {
    const result = vec3()
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cellKey = `${Math.floor(pos[0] / 15) + dx}_${Math.floor(pos[1] / 15) + dy}_${Math.floor(pos[2] / 15) + dz}`
          const cell = this.grid[cellKey]
          if (!cell) continue

          for (const i1 of cell) {
            let point0 = this.points[i1 - 1]
            let point1 = this.points[i1]
            let point2 = this.points[i1 + 1]

            let dir1
            let dir2

            if (!point0) {
              dir1 = dir2 = vec3Normalize(subtract(vec3(), point2, point1))
              point0 = addScaled(vec3(), point1, dir1, -100)
            } else  if (!point2) {
              dir1 = dir2 = vec3Normalize(subtract(vec3(), point1, point0))
              point2 = addScaled(vec3(), point1, dir1, 100)
            } else {
              dir1 = vec3Normalize(subtract(vec3(), point1, point0))
              dir2 = vec3Normalize(subtract(vec3(), point2, point1))
            }

            const dir3 = subtract(vec3(), point2, point0)
            const toPos = subtract(vec3(), pos, point0)
            const projection = scale(vec3(), dir3, dot(toPos, dir3) / dot(dir3, dir3))
            const x = length(projection) / length(dir3)

            const dirToAdd = vec3Lerp(vec3(), dir1, dir2, x)

            const y1 = 1 / Math.max(1, perpendicularDistance(dir1, subtract(vec3(), pos, point0)))
            const y2 = 1 / Math.max(1, perpendicularDistance(dir2, subtract(vec3(), pos, point1)))

            const effect = Math.min(y1, y2)
            addScaled(result, result, dirToAdd, effect)
          }
        }
      }
    }

    const vecLength = length(result)
    if (vecLength > 5) {
      scale(result, result, 5 / vecLength)
    }

    return result
  }
}

export const startTrack = new Track()

for (let i = -100; i <= 500; i++) {
  startTrack.addPoint(vec3([i * 5, -0.01, 0]))
}

export const mainTrack = new Track()

mainTrack.addPoint(vec3())

let startDirection = vec3([1, 0, 0])
let direction = vec3(startDirection)
let directionTo = vec3([1, 0, 0])
for (let i = 0; i < 1000; i++) {
  if (distance(direction, directionTo) < 0.1) {
    directionTo[0] += Math.random() - 0.5
    directionTo[1] += Math.random() - 0.5
    directionTo[2] += Math.random() - 0.5
    vec3Normalize(directionTo)
  }

  vec3Lerp(direction, direction, directionTo, 0.25)

  const newPoint = addScaled(vec3(), mainTrack.points[i], direction, 5)
  mainTrack.addPoint(newPoint)
}

