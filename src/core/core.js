export let deltaTime

export function setDeltaTme (ms) {
  deltaTime = Math.min(0.1, ms / 1000)
}
