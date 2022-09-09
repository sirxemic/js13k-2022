import {
  add,
  addScaled, cross,
  distance, length,
  project,
  subtract,
  vec3,
  vec3Lerp,
  vec3Normalize
} from '../math/vec3.js'
import { KdTreeSpace } from './kdTreeSpace.js'
import { SCALE, TRACK_SEGMENT_LENGTH, VIEW_DISTANCE } from '../constants.js'

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
    let progress = 0

    for (const [{ i }, _] of this.space.getClosestPoints(pos, 3, VIEW_DISTANCE)) {
      let point0 = this.points[i - 1]?.position
      let point1 = this.points[i].position
      let point2 = this.points[i + 1]?.position

      let diff1
      let diff2

      if (!point0) {
        diff1 = diff2 = subtract(vec3(), point2, point1)
        point0 = addScaled(vec3(), point1, diff1, -20)
      } else  if (!point2) {
        diff1 = diff2 = subtract(vec3(), point1, point0)
        point2 = addScaled(vec3(), point1, diff1, 20)
      } else {
        diff1 = subtract(vec3(), point1, point0)
        diff2 = subtract(vec3(), point2, point1)
      }

      const diff1Length = length(diff1)
      const diff2Length = length(diff2)

      vec3Normalize(diff1)
      vec3Normalize(diff2)

      const posRelativeTo1 = subtract(vec3(), pos, point1)

      const projection1 = project(vec3(), subtract(vec3(), pos, point0), diff1)
      const projection2 = project(vec3(), posRelativeTo1, diff2)

      const p1Length = length(projection1)
      const p2Length = length(projection2)

      add(projection1, projection1, point0)
      add(projection2, projection2, point1)

      const dist1 = distance(projection1, pos)
      const dist2 = distance(projection2, pos)
      const dist3 = distance(point1, pos)

      if (dist1 < minDist) {
        minDist = dist1
        closestDir = diff1
        closestPoint = projection1
        progress = i - 1 + p1Length / diff1Length
      }
      if (dist2 < minDist) {
        minDist = dist2
        closestDir = diff2
        closestPoint = projection2
        progress = i + p2Length / diff2Length
      }
      if (dist3 < minDist) {
        minDist = dist3
        closestPoint = point1
        const cornerNormal = cross(vec3(), diff1, diff2)
        closestDir = vec3Normalize(cross(vec3(), posRelativeTo1, cornerNormal))
        progress = i
      }
    }

    return [minDist, closestPoint, closestDir || vec3(), progress / (this.points.length - 1)]
  }
}

export const startTrack = new Track()

for (let i = -10; i <= 50; i++) {
  startTrack.addPoint(vec3([i * TRACK_SEGMENT_LENGTH, 0, 0]))
}

startTrack.update()

export const mainTrack = new Track()

mainTrack.addPoint(vec3())

const mainTrackEndingLength = 100 * SCALE
const segments = 1000
const endingSegmentsCount = Math.ceil(mainTrackEndingLength / TRACK_SEGMENT_LENGTH)
export const mainTrackEndingStart = 100 * (1 - endingSegmentsCount * 0.9 / (segments - 1))

let startDirection = vec3([1, 0, 0])
let direction = vec3(startDirection)
let directionTo = vec3([1, 0, 0])
for (let i = 0; i < segments; i++) {
  if (i >= 15 && i < (segments - endingSegmentsCount - 1) && distance(direction, directionTo) < 0.1) {
    directionTo[0] += Math.random() - 0.5
    directionTo[1] += Math.random() - 0.5
    directionTo[2] += Math.random() - 0.5
    vec3Normalize(directionTo)
  }

  vec3Normalize(vec3Lerp(direction, direction, directionTo, 0.25))

  const newPoint = vec3()
  addScaled(newPoint, mainTrack.points[i].position, direction, TRACK_SEGMENT_LENGTH)
  mainTrack.addPoint(newPoint)
}

mainTrack.update()
