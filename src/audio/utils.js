import { audioContext, contextSampleRate } from './context.js'
import { EnvelopeSampler } from '../utils.js'

export function decibelsToAmplitude (db) {
  return 10 ** (db / 20)
}

export function amplitudeToDecibels (amplitude) {
  return 20 * Math.log10(amplitude)
}

export function sampleSine (position) {
  return Math.sin(2 * Math.PI * position)
}

export function sampleSawtooth (position) {
  return (position % 1) * 2 - 1
}

export function sampleTriangle (position) {
  return Math.abs((position % 1) * 2 - 1) * 2 - 1
}

export function sampleSquare (position) {
  return samplePulse(position, 0.5)
}

export function samplePulse (position, length) {
  return (position % 1 < length) * 2 - 1
}

export function sampleSkewedSine (p, skew) {
  p %= 1
  if (p < 0.25 * skew) {
    p = p / skew
  } else  if (p < 0.5) {
    p = 0.25 + 0.25 * (p - 0.25 * skew) / (0.5 - 0.25 * skew)
  } else if (p < 1 - 0.25 * skew) {
    p = 0.5 + 0.25 * (p - 0.5) / (1 - 0.25 * skew - 0.5)
  } else {
    p = 0.75 + 0.25 * (p - (1 - 0.25 * skew)) / (0.25 * skew)
  }
  return Math.sin(2 * Math.PI * p)
}

export function sampleNoise () {
  return Math.random() * 2 - 1
}

export function detune (freq, cents) {
  return freq * 2 ** (cents / 1200)
}

function ensureEnvelope (envelopeOrValue) {
  if (typeof envelopeOrValue === 'number') {
    return [[0, envelopeOrValue], [1, envelopeOrValue]]
  }
  return envelopeOrValue
}

function coefficients (b0, b1, b2, a0, a1, a2) {
  return [
    b0 / a0,
    b1 / a0,
    b2 / a0,
    a1 / a0,
    a2 / a0
  ]
}

function getHighPassCoefficients (frequency, Q) {
  let n = Math.tan(Math.PI * frequency / contextSampleRate)
  let nSquared = n * n
  let invQ = 1 / Q
  let c1 = 1 / (1 + invQ * n + nSquared)

  return coefficients(
    c1, c1 * -2,
    c1, 1,
    c1 * 2 * (nSquared - 1),
    c1 * (1 - invQ * n + nSquared)
  )
}

function getLowPassCoefficients (frequency, Q) {
  let n = 1 / Math.tan(Math.PI * frequency / contextSampleRate)
  let nSquared = n * n
  let invQ = 1 / Q
  let c1 = 1 / (1 + invQ * n + nSquared)

  return coefficients(
    c1, c1 * 2,
    c1, 1,
    c1 * 2 * (1 - nSquared),
    c1 * (1 - invQ * n + nSquared)
  )
}

function getBandPassCoefficients (frequency, Q) {
  let n = 1 / Math.tan(Math.PI * frequency / contextSampleRate)
  let nSquared = n * n
  let invQ = 1 / Q
  let c1 = 1 / (1 + invQ * n + nSquared)

  return coefficients(
    c1 * n * invQ, 0,
    -c1 * n * invQ, 1,
    c1 * 2 * (1 - nSquared),
    c1 * (1 - invQ * n + nSquared)
  )
}

function getHighShelfCoefficients (cutOffFrequency, Q, gainFactor) {
  const A = Math.sqrt(gainFactor)
  const aminus1 = A - 1
  const aplus1 = A + 1
  const omega = (Math.PI * 2 * cutOffFrequency) / contextSampleRate
  const coso = Math.cos(omega)
  const beta = Math.sin(omega) * Math.sqrt(A) / Q
  const aminus1TimesCoso = aminus1 * coso

  return coefficients (
    A * (aplus1 + aminus1TimesCoso + beta),
    A * -2.0 * (aminus1 + aplus1 * coso),
    A * (aplus1 + aminus1TimesCoso - beta),
    aplus1 - aminus1TimesCoso + beta,
    2.0 * (aminus1 - aplus1 * coso),
    aplus1 - aminus1TimesCoso - beta
  )
}

function getPeakFilterCoefficients (frequency, Q, gainFactor) {
  const A = Math.sqrt(gainFactor)
  const omega = (Math.PI * 2 * frequency) / sampleRate
  const alpha = 0.5 * Math.sin(omega) / Q
  const c2 = -2.0 * Math.cos(omega)
  const alphaTimesA = alpha * A
  const alphaOverA = alpha / A

  return coefficients(
    1.0 + alphaTimesA,
    c2,
    1.0 - alphaTimesA,
    1.0 + alphaOverA,
    c2,
    1.0 - alphaOverA
  )
}

function filter (buffer, coeffFunction) {
  let lv1 = 0
  let lv2 = 0

  for (let i = 0; i < buffer.length; ++i) {
    let coeffs = coeffFunction(i / (buffer.length - 1))

    let inV = buffer[i]
    let outV = (inV * coeffs[0]) + lv1
    buffer[i] = outV

    lv1 = (inV * coeffs[1]) - (outV * coeffs[3]) + lv2
    lv2 = (inV * coeffs[2]) - (outV * coeffs[4])
  }

  return buffer
}

export function lowPassFilter (buffer, frequencies, Q = Math.SQRT1_2) {
  const freqSampler = new EnvelopeSampler(ensureEnvelope(frequencies), true)
  const qSampler = new EnvelopeSampler(ensureEnvelope(Q))

  return filter(buffer, x => getLowPassCoefficients(freqSampler.sample(x), qSampler.sample(x)))
}

export function highPassFilter (buffer, frequencies, Q = Math.SQRT1_2) {
  const freqSampler = new EnvelopeSampler(ensureEnvelope(frequencies), true)
  const qSampler = new EnvelopeSampler(ensureEnvelope(Q))

  return filter(buffer, x => getHighPassCoefficients(freqSampler.sample(x), qSampler.sample(x)))
}

export function bandPassFilter (buffer, frequencies, Q = Math.SQRT1_2) {
  const freqSampler = new EnvelopeSampler(ensureEnvelope(frequencies), true)
  const qSampler = new EnvelopeSampler(ensureEnvelope(Q))

  return filter(buffer, x => getBandPassCoefficients(freqSampler.sample(x), qSampler.sample(x)))
}

export function highShelf (buffer, cutOffFrequencies, Q, gainFactor) {
  const freqSampler = new EnvelopeSampler(ensureEnvelope(cutOffFrequencies), true)
  const qSampler = new EnvelopeSampler(ensureEnvelope(Q))
  const gainSampler = new EnvelopeSampler(ensureEnvelope(gainFactor))

  return filter(buffer, x => getHighShelfCoefficients(freqSampler.sample(x), qSampler.sample(x), gainSampler.sample(x)))
}

export function peakFilter (buffer, frequencies, Q, gainFactor) {
  const freqSampler = new EnvelopeSampler(ensureEnvelope(frequencies), true)
  const qSampler = new EnvelopeSampler(ensureEnvelope(Q))
  const gainSampler = new EnvelopeSampler(ensureEnvelope(gainFactor))

  return filter(buffer, x => getPeakFilterCoefficients(freqSampler.sample(x), qSampler.sample(x), gainSampler.sample(x)))
}

export function distort (buffer, amount) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] *= amount
    if (buffer[i] < -1) buffer[i] = -1
    else if (buffer[i] > 1) buffer[i] = 1
    else buffer[i] = Math.sin(buffer[i] * Math.PI / 2)
    buffer[i] /= amount
  }
  return buffer
}

function combineSounds (buffers, func) {
  let maxLength = 0
  buffers.forEach(buffer => { maxLength = Math.max(maxLength, buffer.length) })

  const outputBuffer = new Float32Array(maxLength)

  buffers.forEach((buffer, j) => {
    for (let i = 0; i < buffer.length; i++) {
      func(outputBuffer, j, buffer, i, buffers.length)
    }
  })

  return outputBuffer
}

export function sumSounds (buffers, scalars = [1, 1, 1]) {
  return combineSounds(buffers, (data, bufferIndex, bufferData, sampleIndex, bufferCount) => {
    data[sampleIndex] += scalars[bufferIndex] * bufferData[sampleIndex] / bufferCount
  })
}

export function multiplySounds (buffers) {
  return combineSounds(buffers, (data, bufferIndex, bufferData, sampleIndex, bufferCount) => {
    if (bufferIndex === 0) {
      data[sampleIndex] = 1
    }
    data[sampleIndex] *= bufferData[sampleIndex] / bufferCount
  })
}

export function generateSound (length, sampleFunction) {
  const buffer = new Float32Array(length * contextSampleRate)

  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = sampleFunction(i / buffer.length, i / contextSampleRate)
  }

  return buffer
}

export function applyEnvelope (buffer, envelope) {
  const sampler = new EnvelopeSampler(envelope)
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] *= sampler.sample(i / buffer.length)
  }

  return buffer
}

export function getFrequencyDelta (freq) {
  return freq / contextSampleRate
}

export function createAudioBuffer (array) {
  if (!Array.isArray(array)) {
    array = [array]
  }
  const result = audioContext.createBuffer(array.length, array[0].length, contextSampleRate)
  for (let i = 0; i < array.length; i++) {
    result.getChannelData(i).set(array[i])
  }

  return result
}
