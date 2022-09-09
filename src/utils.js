let reloading = false

export function reload () {
  if (reloading) {
    return
  }

  reloading = true
  location.reload()
}

export class EnvelopeSampler {
  constructor (envelope, logarithmic = false) {
    this.envelope = envelope
    this.logarithmic = logarithmic
    this.reset()
  }

  reset () {
    this.i = 0
  }

  sample (position) {
    while (this.i < this.envelope.length - 1) {
      let [t1, v1, curve = 1] = this.envelope[this.i]
      let [t2, v2] = this.envelope[this.i + 1]
      if (t1 <= position && position < t2) {
        let t = (position - t1) / (t2 - t1)
        if (curve > 1) {
          t = t ** curve
        } else {
          t = 1 - (1 - t) ** (1 / curve)
        }
        return this.logarithmic ? v1 * (v2 / v1) ** t : v1 + t * (v2 - v1)
      }
      this.i++
    }
    return this.envelope[this.envelope.length - 1][1]
  }
}

export function getRandomBrightColor () {
  let r = Math.random() * 0.5 + 0.5
  let g = Math.random() * 0.5 + 0.5
  let b = Math.random() * 0.5 + 0.5
  const c = Math.random()
  if (c < 1/7) { r = 0.1 }
  else if (c < 2/7) { r = 0.1; g = 0.1 }
  else if (c < 3/7) { g = 0.1 }
  else if (c < 4/7) { g = 0.1; b = 0.1 }
  else if (c < 5/7) { b = 0.1 }
  else if (c < 6/7) { b = 0.1; r = 0.1 }
  return [r, g, b]
}

/**
 * Waiting for the next frame is useful for preventing the browser to hang
 * while the assets are being generated
 */
export const waitForNextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))
