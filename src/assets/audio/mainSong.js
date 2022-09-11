import { audioMix } from '../audioMix.js'
import { audioContext, contextSampleRate, createBiquadFilter } from '../../audio/context.js'
import { addNotes, createTempBuffer, getOffsetForBar } from '../../audio/musicUtils.js'
import { trianglePluck } from './mainSongSounds/trianglePluck.js'
import { detuned } from './mainSongSounds/detuned.js'
import { lead1, lead2 } from './mainSongSounds/leads.js'
import { kick } from './mainSongSounds/kick.js'
import { snare } from './mainSongSounds/snare.js'
import { chords } from './mainSongSounds/chords.js'
import { hihat, sweep } from './mainSongSounds/hihats.js'
import { updateInitProgress } from '../../utils.js'

export let mainSong

let bpm = 150
let songBeatAmount = 33 * 4

let scale1 = [3, 5, 6, 8, 10, 11, 13]
let scale2 = [3, 5, 6, 8, 10, 12, 13]
let currentScale = scale1

const monoBuffer = () => audioContext.createBuffer(1, getBufferSize(songBeatAmount), contextSampleRate)
const stereoBuffer = () => audioContext.createBuffer(2, getBufferSize(songBeatAmount), contextSampleRate)

function getNote (num) {
  const octave = Math.floor(num / 7)
  num = num - octave * 7
  return currentScale[num] + octave * 12
}

function getBufferSize (beatCount) {
  return Math.ceil(contextSampleRate * beatCount * 60 / bpm)
}

function formatLoop (loop, transpose = 0, offset = 0) {
  const result = []
  for (let i = 0; i < loop.length; i++) {
    for (const note of loop[i]) {
      result.push([i * 0.5 + offset, getNote(note) + transpose])
    }
  }
  return result
}

function createArpsTrack () {
  const trackBuffer = monoBuffer()

  const result = trackBuffer.getChannelData(0)

  function addLoop1 (offset) {
    currentScale = scale1
    const loop = formatLoop([
      [0, -7, -14], [2], [4], [0], [6], [0], [2], [4],
      [0], [2], [4], [0], [6], [0], [2], [7],
      [0, -9, -16], [2], [4], [0], [6], [0], [2], [4],
      [0], [2], [4], [0], [6], [0], [2], [4],
      [-1, -8, -15], [1], [3], [-1], [6], [-1], [1], [3],
      [-1], [1], [3], [-1], [6], [-1], [1], [3],
      [-1, -10, -17], [1], [3], [-1], [6], [-1], [1], [3],
      [-1], [1], [3], [-1], [6], [-1], [1], [7]
    ], -12, offset)

    addNotes(loop, result, trianglePluck, bpm)
  }

  addLoop1(0)
  addLoop1(8 * 4)

  function addLoop2 (offset) {
    currentScale = scale1
    const loop = formatLoop([
      [0, -9, -16], [2], [4], [0], [6], [0], [2], [4],
      [0], [2], [4], [0], [6], [0], [2], [7],
      [0, -7, -14], [2], [4], [0], [6], [0], [2], [4],
      [-1, -8, -15], [2], [4], [-1], [6], [-1], [2], [4],
      [0, -9, -16], [2], [4], [0], [6], [0], [2], [4],
      [0], [2], [4], [0], [6], [0], [2], [7],
      [0, -7, -14], [2], [4], [0], [6], [0], [2], [4]
    ], -12, offset)

    addNotes(loop, result, trianglePluck, bpm)

    currentScale = scale2
    const loopLastPart = formatLoop([
      [-2, -4, -11], [0], [3], [-2], [6], [-2], [0], [2]
    ], -12, offset + 28)

    addNotes(loopLastPart, result, trianglePluck, bpm)

    return result
  }

  addLoop2(16 * 4)
  addLoop2(24 * 4)

  addNotes([
    [32 * 4, getNote(-2) - 12],
    [32 * 4, getNote(0)],
    [32 * 4 + 0.5, getNote(0) - 12],
    [32 * 4 + 1, getNote(2) - 12],
    [32 * 4 + 1.5, getNote(4) - 12],
    [32 * 4 + 2, getNote(2) - 12],
    [32 * 4 + 2.5, getNote(-2) - 12],
    [32 * 4 + 3, getNote(1) - 12],
    [32 * 4 + 3.5, getNote(0) - 12],
  ], result, trianglePluck, bpm)

  return trackBuffer
}

const detunedNotes = [
  [0, 0, 1],
  [1, -2, 1],
  [2, -1, 1],
  [3, -3, 1],
  [4, 0, 1],
  [5, -2, 1],
  [6, -1, 1],
  [7, -3, 1],

  [8, -2, 1],
  [9, 0, .5],
  [9.5, -1, .5],
  [10, -2, 1],
  [11, 0, .5],
  [11.5, 3, .5],
  [12, -2, 1],
  [13, 0, .5],
  [13.5, -1, .5],
  [14, -2, 1],
  [15, 0, .5],
  [15.5, 3, 1.5],
]

function createBassTrack () {
  const trackBuffer = stereoBuffer()

  currentScale = scale1
  addNotes(
    detunedNotes.map(([offset, note, length]) => [offset * 8, getNote(note) - 36, length * 8]),
    [trackBuffer.getChannelData(0), trackBuffer.getChannelData(1)],
    detuned,
    bpm
  )

  return trackBuffer
}

function createSubtlePadTrack () {
  const trackBuffer = stereoBuffer()

  currentScale = scale1
  addNotes(
    [
      ...detunedNotes.map(([offset, note, length]) => [offset * 8, getNote(note) - 24, length * 8]),
      ...detunedNotes.map(([offset, note, length]) => [offset * 8, getNote(note) - 12, length * 8])
    ],
    [trackBuffer.getChannelData(0), trackBuffer.getChannelData(1)],
    detuned,
    bpm
  )

  return trackBuffer
}

function createSoftLeadTrack() {
  const trackBuffer = stereoBuffer()

  currentScale = scale1
  const melody = [
    [2, 4],
    [1, 2],
    [-1, 2],
    [0, 7],
    [1, 0.5],
    [2, 0.5],
    [3, 4],
    [2, 2],
    [1, 2],
    [1, 4],
    [2, 2],
    [3, 2],
    [4, 6],
    [6, 1.5],
    [3, 6.5],
    [6, 1.5],
    [3, 4.5],
    [4, 3.25],
    [3, 0.25],
    [2, 0.25],
    [1, 0.25],
    [0, 4],
    [1, 2],
    [2, 2],
    [2, 6],
    [1, 1],
    [2, 1],
    [4, 3.5],
    [3, 0.25],
    [2, 0.25],
    [3, 2],
    [4, 2],
    [0, 7.5],
    [1, 0.25],
    [2, 0.25],
    [4, 3.5],
    [3, 0.25],
    [2, 0.25],
    [3, 2],
    [2, 1],
    [1, 1],
    [0, 6],
    [1, 1],
    [2, 1],
    [4, 3.5],
    [3, 0.25],
    [2, 0.25],
    [3, 2],
    [4, 2],
    [0, 7.5],
    [1, 0.25],
    [2, 0.25],
    [4, 3.5],
    [3, 0.25],
    [2, 0.25],
    [3, 2],
    [2, 1],
    [1, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [1, 1]
  ]

  let offset = 0
  const notes = []
  for (const entry of melody) {
    notes.push([offset, getNote(entry[0]) - 12, entry[1]])
    offset += entry[1]
  }

  addNotes(
    notes,
    [trackBuffer.getChannelData(0), trackBuffer.getChannelData(1)],
    detuned,
    bpm
  )

  return trackBuffer
}

const commonLead = [
  [110, 5, 1],
  [111, 6, 0.75],
  [112, 6, 0.75],
  [112.75, 5, 0.5],
  [113.5, 4, 0.33],
  [114, 4, 3.33],
  [117.5, 4, 0.16],
  [117.66, 5, 0.16],
  [117.83, 6, 0.16],
  [118, 7, 1],
  [119, 8, 1],
  [120, 9, 3.1],
  [123.33, 7, 0.16],
  [123.5, 8, 0.16],
  [123.66, 9, 0.16],
  [123.83, 10, 0.16],
]

function createLead1Track () {
  const trackBuffer = monoBuffer()

  currentScale = scale1

  const part1 = [
    [0, 2, 4],
    [4, 1, 2],
    [6, -1, 1.5],
    [7.75, -1, 0.25],

    [8, 0, 3.5],
    [11.5, -1, 0.25],
    [11.75, 0, 0.25],

    [12, 1, 1.75],
    [14, 2, 0.5],
    [15, 1, 0.25],
    [15.25, 2, 0.25],
    [15.5, 3, 0.25],
    [15.75, 4, 0.25 + 1 + 0.5],

    [17.5, 3, 0.25],
    [17.75, 2, 0.4],
    [18.5, 3, 2.9],
    [21.5, 2, 0.25],
    [21.75, 1, 0.25],
    [22, 2, 0.125],
    [22.125, 3, 0.5],
    [22.75, 2, 0.5],
    [23.5, 1, 0.5],
    [24, 1, 3],
    [27.5, 0, 0.25],
    [27.75, 1, 0.25],
    [28, 2, 1.5],
    [29.5, 1, 0.25],
    [29.75, 2, 0.25],
    [30, 3, 1.5],
    [31.5, 2, 0.25],
    [31.75, 3, 0.25],
    [32, 4, 3],
    [35.5, 4, .5],
    [36, 7, 1.5],
    [37.5, 9, 1],
    [38.5, 8, 1],
    [39.5, 6, 3.6],
    [43.5, 6, 0.5],
    [44, 7, 0.75],
    [44.75, 6, 0.75],
    [45.5, 4, 0.75],
    [46.5, 3, 1],
    [48, 3, 0.75],
    [48.75, 4, 0.7],
    [49.5, 3, 0.4],
    [50, 3, 0.5],
    [50.67, 2, 0.5],
    [51.33, 2, 0.5],
    [52, 2, 0.5],
    [52.67, 3, 0.5],
    [53.33, 2, 0.5],
    [54, 1, 0.5],
    [54.67, 0, 0.5],
    [55.33, 1, 0.5],
    [56, 2, 3.25],
    [59.5, 1, 0.25],
    [59.75, 2, 0.25],
    [60, 3, 1.6],
    [62, 4, 1.6],

    [87.16, 1, 0.16],
    [87.33, 0, 0.16],
    [87.5, 1, 0.16],
    [87.66, 2, 0.16],
    [87.83, 3, 0.16],
    [88, 4, 3.5],

    [105.5, 7, 1.5],
    [107, 6, 0.5],
    [107.5, 5, 0.5],
    [108, 4, 2]
  ]

  addNotes(
    part1.map(([offset, note, length]) => [offset, getNote(note) + 12, length]),
    trackBuffer.getChannelData(0),
    lead1,
    bpm
  )
  addNotes(
    part1.map(([offset, note, length]) => [offset, getNote(note) - 12, length]),
    trackBuffer.getChannelData(0),
    lead1,
    bpm
  )

  const part2 = [
    [94, 3, 2],
    [96, 2, 4],
    ...commonLead,
    [124, 11, 1.5],
    [125.5, 10, 0.16],
    [125.66, 9, 0.16],
    [125.83, 8, 0.16],
    [126, 7, 1.5],
    [127.5, 7, 0.16],
    [127.66, 6, 0.16],
    [127.83, 5, 0.16],
    [128, 4, 4],
  ]

  addNotes(
    part2.map(([offset, note, length]) => [offset, getNote(note) + 12, length]),
    trackBuffer.getChannelData(0),
    lead1,
    bpm
  )

  return trackBuffer
}

function createLead2Track () {
  const trackBuffer = monoBuffer()

  currentScale = scale1

  const part = [
    [64, 4, 3.2],
    [67.5, 3, 0.25],
    [67.75, 4, 0.25],
    [68, 5, 2],
    [70, 4, 1],
    [71, 3, 0.5],
    [72, 3, 0.5],
    [72.67, 4, 0.4],
    [73.33, 4, 0.4],
    [74, 4, 1.5],
    [75.5, 3, 0.25],
    [75.75, 4, 0.25],
    [76, 5, 2],
    [78, 6, 2],
    [80, 3, 1.5],
    [81.5, 4, 0.25],
    [82, 0, 5],
    [91.25, 3, 0.25],
    [91.5, 2, 0.25],
    [91.75, 1, 0.25],
    [92, 2, 2],
    [94, -1, 2],
    [96, 0, 3],
    [99.5, 3, 0.16],
    [99.66, 4, 0.16],
    [99.83, 5, 0.16],
    [100, 6, 1.5],
    [101.5, 5, 1.5],
    [103, 4, 1],
    [104, 3, 1.5],

    ...commonLead,
    [124, 11, 2],
    [126, 10, 1],
    [127, 9, 0.6],
    [128, 10, 4],
  ]

  addNotes(
    part.map(([offset, note, length]) => [offset, getNote(note), length]),
    trackBuffer.getChannelData(0),
    lead2,
    bpm
  )

  return trackBuffer
}

function createKickTrack () {
  const trackBuffer = monoBuffer()
  const buffer = trackBuffer.getChannelData(0)

  currentScale = scale1

  const loop = createTempBuffer(4, bpm)
  addNotes([
    [0, 0],
    [2.5, 0],
  ], loop, kick, bpm)

  for (let i = 0; i < 33; i++) {
    const slice = i === 15 || i === 32 ? loop.subarray(0, loop.length / 2) : loop
    const offset = getOffsetForBar(i, bpm)
    buffer.set(slice, offset)
  }

  return trackBuffer
}


function createSnareTrack () {
  const trackBuffer = monoBuffer()
  const buffer = trackBuffer.getChannelData(0)

  currentScale = scale1

  const loop1 = createTempBuffer(4, bpm)
  addNotes([
    [1, 0, 0, 1],
    [3, 0, 0, 1],
  ], loop1, snare, bpm)

  const loop2 = createTempBuffer(4, bpm)
  addNotes([
    [1, 0, 0, 1],
    [3, 0, 0, 1],
    [3.5, 0, 0, 0.8],
  ], loop2, snare, bpm, true)

  for (let i = 0; i < 32; i++) {
    const offset = getOffsetForBar(i, bpm)
    buffer.set(i % 4 === 3 ? loop2 : loop1, offset)
  }

  return trackBuffer
}

function createHihatsTrack () {
  const trackBuffer = monoBuffer()
  const buffer = trackBuffer.getChannelData(0)

  currentScale = scale1

  const loop = createTempBuffer(4, bpm)
  addNotes([
    [0, 0, 0, 0.5],
    [0.5, 0, 0, 1],
    [1.5, 0, 0, 1],
    [2, 0, 0, 1],
    [2.5, 0, 0, 0.5],
    [3.5, 0, 0, 1]
  ], loop, hihat, bpm)

  for (let i = 0; i < 32; i++) {
    const offset = getOffsetForBar(i, bpm)
    buffer.set(loop, offset)
  }

  addNotes([
    [6 * 4 + 3, 0, 5],
    [14 * 4 + 3, 0, 5],
    [31 * 4 + 3, 0, 5],
  ], buffer, sweep, bpm)

  return trackBuffer
}

function createChordsTrack () {
  const trackBuffer = stereoBuffer()

  currentScale = scale1

  const chordNotes = [
    [1, 0, 4, 9],
    [1, -2, 2, 7],
    [1, -1, 3, 6],
    [1, -3, 1, 6],

    [1, 0, 4, 7],
    [1, -2, 2, 7],
    [1, -1, 3, 6],
    [1, -3, 1, 6],

    [1, -2, 2, 7],
    [0.5, 0, 4, 7],
    [0.5, -1, 3, 6],

    [1, -2, 2, 7],
    [0.5, 0, 4, 7],
    [0.5, 0, 3, 8],

    [1, -2, 2, 7, 9],
    [0.5, 0, 4, 7, 9],
    [0.5, -1, 3, 6, 8],

    [1, -2, 2, 5, 7],
    [0.5, 0, 4, 4, 6],
  ]

  let offset = 0
  const notes = []
  for (const [length, ...chord] of chordNotes) {
    for (let note of chord) {
      notes.push([offset, getNote(note) - 12, length * 8])
    }
    offset += length * 8
  }

  currentScale = scale2
  notes.push([31 * 4, getNote(3) - 12, 8])
  notes.push([31 * 4, getNote(5) - 12, 8])
  notes.push([31 * 4, getNote(7) - 12, 8])

  addNotes(notes, [trackBuffer.getChannelData(0), trackBuffer.getChannelData(1)], chords, bpm)

  return trackBuffer
}

function createChannel (buffer) {
  const channelOutput = audioContext.createBufferSource()
  channelOutput.loop = true
  channelOutput.loopEnd = buffer.length
  channelOutput.buffer = buffer
  return channelOutput
}

export const bassStart = 6
export const bassFade = 2

export const subtlePadStart = 16
export const subtlePadFade = 2

export const softLeadStart = 25
export const softLeadFade = 2

export const kickStart = 40
export const kickFade = 2

export const snareStart = 45
export const snareFade = 2

export const hihatsStart = 48
export const hihatsFade = 2

export const chordsStart = 55
export const chordsFade = 2

export const leadsStart = 75
export const leadsFade = 2

export async function generateSong () {
  const arpsChannel = createChannel(createArpsTrack())
  await updateInitProgress()
  const bassChannel = createChannel(createBassTrack())
  await updateInitProgress()
  const subtlePadChannel = createChannel(createSubtlePadTrack())
  await updateInitProgress()
  const softLeadChannel = createChannel(createSoftLeadTrack())
  await updateInitProgress()
  const lead1Channel = createChannel(createLead1Track())
  await updateInitProgress()
  const lead2Channel = createChannel(createLead2Track())
  await updateInitProgress()
  const kickChannel = createChannel(createKickTrack())
  await updateInitProgress()
  const snareChannel = createChannel(createSnareTrack())
  await updateInitProgress()
  const hihatChannel = createChannel(createHihatsTrack())
  await updateInitProgress()
  const chordsChannel = createChannel(createChordsTrack())
  await updateInitProgress()

  mainSong = {
    start () {
      arpsChannel.start()
      bassChannel.start()
      subtlePadChannel.start()
      softLeadChannel.start()
      lead1Channel.start()
      lead2Channel.start()
      kickChannel.start()
      snareChannel.start()
      hihatChannel.start()
      chordsChannel.start()

      audioMix.addMusicChannel(-1, 0, arpsChannel, 0.125 /*decibelsToAmplitude(-18)*/, 1 /*decibelsToAmplitude(0)*/)
      audioMix.addMusicChannel(bassStart, bassStart + bassFade, bassChannel, 0.25 /*decibelsToAmplitude(-12)*/, 0)
      audioMix.addMusicChannel(subtlePadStart, subtlePadStart + subtlePadFade, subtlePadChannel, 0.15 /*decibelsToAmplitude(-16.5)*/, 1 /*decibelsToAmplitude(0)*/)

      audioMix.addMusicChannel(softLeadStart, softLeadStart + softLeadFade, softLeadChannel, 0.25 /*decibelsToAmplitude(-12)*/, 1 /*decibelsToAmplitude(0)*/)

      audioMix.addMusicChannel(kickStart, kickStart + kickFade, kickChannel, 0.16 /*decibelsToAmplitude(-16)*/, 0)

      const hihatsFilter = createBiquadFilter('highpass', 5000)
      hihatChannel.connect(hihatsFilter)

      audioMix.addMusicChannel(hihatsStart, hihatsStart + hihatsFade, hihatsFilter, 0.06 /*decibelsToAmplitude(-24)*/, 0.31 /*decibelsToAmplitude(-10)*/)
      audioMix.addMusicChannel(snareStart, snareStart + snareFade, snareChannel, 0.08 /*decibelsToAmplitude(-22)*/, 0.31 /*decibelsToAmplitude(-10)*/)

      const chordsFilter = createBiquadFilter('peaking', 557, 1.33, -7.6)
      chordsChannel.connect(chordsFilter)

      audioMix.addMusicChannel(chordsStart, chordsStart + chordsFade, chordsFilter, 0.15 /*decibelsToAmplitude(-16.5)*/, 0.31 /*decibelsToAmplitude(-10)*/)

      const leadsFilter = createBiquadFilter('lowpass', 5000)

      lead1Channel.connect(leadsFilter)
      lead2Channel.connect(leadsFilter)

      audioMix.addMusicChannel(leadsStart, leadsStart + leadsFade, leadsFilter, 0.05 /*decibelsToAmplitude(-26)*/, 1 /*decibelsToAmplitude(0)*/)
    }
  }
}
