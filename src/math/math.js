export function clamp (x, min, max) {
  return Math.min(Math.max(x, min), max)
}

export function saturate (x) {
  return clamp(x, 0, 1)
}
