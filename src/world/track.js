import { add, addScaled, cross, distance, project, subtract, vec3, vec3Lerp, vec3Normalize } from '../math/vec3.js'
import { KdTreeSpace } from './kdTreeSpace.js'

class Track {
  constructor () {
    this.points = []
  }

  addPoint (position) {
    this.points.push({ i: this.points.length, position })
  }

  update () {
    this.space = new KdTreeSpace(this.points)
  }

  // <debug>
  getPointsData () {
    const result = []
    for (const point of this.points) {
      result.push(
        point.position[0],
        point.position[1],
        point.position[2]
      )
    }
    return new Float32Array(result)
  }
  // </debug>

  getDistanceAndDirection (pos) {
    let minDist = 1000

    let closestDir
    let closestPoint

    for (const [{ i }, _] of this.space.getClosestPoints(pos, 3, 50)) {
      let point0 = this.points[i - 1]?.position
      let point1 = this.points[i].position
      let point2 = this.points[i + 1]?.position

      let diff1
      let diff2

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

      const posRelativeTo1 = subtract(vec3(), pos, point1)

      const projection1 = project(vec3(), subtract(vec3(), pos, point0), diff1)
      const projection2 = project(vec3(), posRelativeTo1, diff2)

      add(projection1, projection1, point0)
      add(projection2, projection2, point1)

      const dist1 = distance(projection1, pos)
      const dist2 = distance(projection2, pos)
      const dist3 = distance(point1, pos)

      if (dist1 < minDist) {
        minDist = dist1
        closestPoint = projection1
        closestDir = diff1
      }
      if (dist2 < minDist) {
        minDist = dist2
        closestPoint = projection2
        closestDir = diff2
      }
      if (dist3 < minDist) {
        minDist = dist3
        closestPoint = point1
        const cornerNormal = cross(vec3(), diff1, diff2)
        closestDir = vec3Normalize(cross(vec3(), posRelativeTo1, cornerNormal))
      }
    }

    return [minDist, closestPoint, closestDir || vec3()]
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
  if (i > 15 && distance(direction, directionTo) < 0.1) {
    directionTo[0] += Math.random() - 0.5
    directionTo[1] += Math.random() - 0.5
    directionTo[2] += Math.random() - 0.5
    vec3Normalize(directionTo)
  }

  vec3Normalize(vec3Lerp(direction, direction, directionTo, 0.25))

  const newPoint = vec3()
  addScaled(newPoint, mainTrack.points[i].position, direction, 5)
  mainTrack.addPoint(newPoint)
}

mainTrack.update()

console.log(mainTrack.space.getClosestPoints(vec3(), 2, 50))
