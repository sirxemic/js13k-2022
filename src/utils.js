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
