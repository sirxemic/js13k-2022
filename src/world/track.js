import {
  add,
  addScaled,
  distance,
  dot,
  length,
  perpendicularDistance, project,
  scale,
  subtract,
  vec3,
  vec3Lerp,
  vec3Normalize
} from '../math/vec3.js'
import { GridSpace } from './gridSpace.js'
import { KdTreeSpace } from './kdTreeSpace.js'

class Track {
  constructor () {
    this.points = []
  }

  addPoint (position) {
    this.points.push({ i: this.points.length, position })
  }

  update () {
    this.space = new GridSpace(this.points)
  }

  getPointsData () {
    const result = []
    for (const point of this.points) {
      result.push(
        point.position[0],
        point.position[1],
        point.position[2]
      )
    }
    return result
  }

  getDistanceAndDirection (pos) {
    let minDist = 1000

    let closest = null

    for (const [{ i }, _] of this.space.getClosestPoints(pos, 3, 50)) {
      let point0 = this.points[i - 1]?.position
      let point1 = this.points[i].position
      let point2 = this.points[i + 1]?.position

      let diff1
      let diff2
      let diff3 = vec3()

      if (!point0) {
        diff1 = diff2 = vec3Normalize(subtract(vec3(), point2, point1))
        point0 = addScaled(vec3(), point1, diff1, -100)
      } else  if (!point2) {
        diff1 = diff2 = vec3Normalize(subtract(vec3(), point1, point0))
        point2 = addScaled(vec3(), point1, diff1, 100)
      } else {
        diff1 = vec3Normalize(subtract(vec3(), point1, point0))
        diff2 = vec3Normalize(subtract(vec3(), point2, point1))
      }

      add(diff3, diff1, diff2)
      scale(diff3, diff3, 0.5)

      const projection1 = project(vec3(), diff1, subtract(vec3(), pos, point0))
      const projection2 = project(vec3(), diff2, subtract(vec3(), pos, point1))

      const dist1 = distance(projection1, pos)
      const dist2 = distance(projection2, pos)
      const dist3 = distance(point1, pos)

      if (dist1 < minDist) {
        minDist = dist1
        closest = [point0, diff1]
      }
      if (dist2 < minDist) {
        minDist = dist2
        closest = [point1, diff2]
      }
      if (dist3 < minDist) {
        minDist = dist3
        closest = [point1, diff3]
      }
    }

    let dir = vec3()
    if (closest) {
      vec3Normalize(dir, closest[1])
      scale(dir, dir, 1 / (minDist + 0.1))
    }
    return [minDist, dir]
  }
}

export const startTrack = new Track()

for (let i = -100; i <= 500; i++) {
  startTrack.addPoint(vec3([i * 5, -0.01, 0]))
}

startTrack.update()

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

  const newPoint = addScaled(vec3(), mainTrack.points[i].position, direction, 5)
  mainTrack.addPoint(newPoint)
}

mainTrack.update()
