export let audioContext = new window.AudioContext({ sampleRate: 22050 })
export let audioDestination = audioContext.createDynamicsCompressor()

audioDestination.connect(audioContext.destination)

export let contextSampleRate = audioContext.sampleRate
