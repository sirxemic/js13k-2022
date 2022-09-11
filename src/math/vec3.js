export function vec3 (args) {
  return new Float32Array(args || 3)
}

export function dot (v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
}

export function length (v) {
  return Math.hypot(...v)
}

export function add (target, v1, v2) {
  target[0] = v1[0] + v2[0]
  target[1] = v1[1] + v2[1]
  target[2] = v1[2] + v2[2]
  return target
}

export function subtract (target, v1, v2) {
  target[0] = v1[0] - v2[0]
  target[1] = v1[1] - v2[1]
  target[2] = v1[2] - v2[2]
  return target
}

export function scale (target, v, scale) {
  target[0] = v[0] * scale
  target[1] = v[1] * scale
  target[2] = v[2] * scale
  return target
}

export function addScaled (target, v1, v2, scale) {
  target[0] = v1[0] + v2[0] * scale
  target[1] = v1[1] + v2[1] * scale
  target[2] = v1[2] + v2[2] * scale
  return target
}

export function vec3Lerp (target, v1, v2, x) {
  target[0] = v1[0] + (v2[0] - v1[0]) * x
  target[1] = v1[1] + (v2[1] - v1[1]) * x
  target[2] = v1[2] + (v2[2] - v1[2]) * x
  return target
}

export function distance(v1, v2) {
  return Math.hypot(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2])
}

export function vec3Normalize (target, vec = target) {
  const m = Math.hypot(vec[0], vec[1], vec[2])
  target[0] = vec[0] / m
  target[1] = vec[1] / m
  target[2] = vec[2] / m
  return target
}

export function cross (target, v1, v2) {
  target[0] = v1[1] * v2[2] - v1[2] * v2[1]
  target[1] = v1[2] * v2[0] - v1[0] * v2[2]
  target[2] = v1[0] * v2[1] - v1[1] * v2[0]
  return target
}

export function applyQuat (target, vec, quat) {
  const x = vec[0], y = vec[1], z = vec[2]
  const qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3]

  const ix = qw * x + qy * z - qz * y
  const iy = qw * y + qz * x - qx * z
  const iz = qw * z + qx * y - qy * x
  const iw = -qx * x - qy * y - qz * z

  target.set([
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx
  ])

  return target
}

export function project (target, toProject, toProjectOnto) {
  return scale(target, toProjectOnto, dot(toProject, toProjectOnto) / dot(toProjectOnto, toProjectOnto))
}

export function fromXYZ (obj) {
  return vec3([obj['x'], obj['y'], obj['z']])
}
