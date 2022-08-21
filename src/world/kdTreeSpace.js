import { distance } from '../math/vec3.js'

function createNode (obj, dimension, parent) {
  return {
    obj,
    left: null,
    right: null,
    parent,
    dimension
  }
}

export class KdTreeSpace {
  constructor (data) {
    const buildTree = (points, depth, parent) => {
      let dim = depth % 3
      if (points.length === 0) return null
      if (points.length === 1) return createNode(points[0], dim, parent)
      points.sort((a, b) => a.position[dim] - b.position[dim])
      const median = Math.floor(points.length / 2)
      const node = createNode(points[median], dim, parent)
      node.left = buildTree(points.slice(0, median), depth + 1, node)
      node.right = buildTree(points.slice(median + 1), depth + 1, node)
      return node
    }

    this.root = buildTree([...data], 0, null)
  }

  getClosestPoints (point, maxNodes, maxDistance) {
    const bestNodes = new BinaryHeap(e => -e[1])

    const saveNode = (node, distance) => {
      bestNodes.push([node, distance])
      if (bestNodes.size() > maxNodes) {
        bestNodes.pop()
      }
    }

    const nearestSearch = (node) => {
      let ownDistance = distance(point, node.obj.position)
      let linearPoint = [0, 0, 0]

      for (let i = 0; i < 3; i++) {
        if (i === node.dimension) {
          linearPoint[i] = point[i]
        } else {
          linearPoint[i] = node.obj[i]
        }
      }

      const linearDistance = distance(linearPoint, node.obj.position)
      if (!node.right && !node.left) {
        if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
          saveNode(node, ownDistance)
        }
        return
      }

      let bestChild
      if (!node.right) {
        bestChild = node.left
      } else if (!node.left) {
        bestChild = node.right
      } else if (point[node.dimension] < node.obj.position[node.dimension]) {
        bestChild = node.left
      } else {
        bestChild = node.right
      }

      nearestSearch(bestChild)

      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        saveNode(node, ownDistance)
      }

      if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
        let otherChild = bestChild === node.left ? node.right : node.left

        if (otherChild) {
          nearestSearch(otherChild)
        }
      }
    }

    for (let i = 0; i < maxNodes; i += 1) {
      bestNodes.push([null, maxDistance])
    }

    nearestSearch(this.root)

    const result = []
    for (let i = 0; i < Math.min(maxNodes, bestNodes.content.length); i++) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]])
      }
    }

    return result
  }
}

class BinaryHeap {
  constructor (scoreFunction) {
    this.content = []
    this.scoreFunction = scoreFunction
  }

  push (element) {
    this.content.push(element)
    this.bubbleUp(this.content.length - 1)
  }

  pop () {
    const result = this.content[0]
    const end = this.content.pop()
    if (this.content.length > 0) {
      this.content[0] = end
      this.sinkDown(0)
    }
    return result
  }

  peek () {
    return this.content[0]
  }

  size () {
    return this.content.length
  }

  bubbleUp (n) {
    const element = this.content[n]
    while (n > 0) {
      const parentN = Math.floor((n + 1) / 2) - 1
      const parent = this.content[parentN]

      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element
        this.content[n] = parent
        n = parentN
      }
      else {
        break
      }
    }
  }

  sinkDown (n) {
    const length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element)

    while (true) {
      const child2N = (n + 1) * 2, child1N = child2N - 1
      let swap = null
      let child1, child1Score
      if (child1N < length) {
        child1 = this.content[child1N]
        child1Score = this.scoreFunction(child1)
        if (child1Score < elemScore)
          swap = child1N
      }

      if (child2N < length) {
        const child2 = this.content[child2N],
          child2Score = this.scoreFunction(child2)
        if (child2Score < (swap == null ? elemScore : child1Score)) {
          swap = child2N
        }
      }

      if (swap != null) {
        this.content[n] = this.content[swap]
        this.content[swap] = element
        n = swap
      }
      else {
        break
      }
    }
  }
}
