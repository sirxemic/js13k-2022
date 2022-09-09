export function clamp (x, min, max) {
  return Math.min(Math.max(x, min), max)
}

export function saturate (x) {
  return clamp(x, 0, 1)
}

export const DEG2RAD = 0.017453292519943295
