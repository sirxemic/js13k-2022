export function setFromAxisAngle (target, axis, angle) {
  const halfAngle = angle / 2, s = Math.sin(halfAngle)

  target[0] = axis[0] * s
  target[1] = axis[1] * s
  target[2] = axis[2] * s
  target[3] = Math.cos(halfAngle)

  return target
}

export function quatMultiply (target, quat1, quat2) {
  const qax = quat1[0], qay = quat1[1], qaz = quat1[2], qaw = quat1[3]
  const qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3]

  target[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby
  target[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz
  target[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx
  target[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz

  return target
}

export function quatFromMat4 (target, mat4) {
  const te = mat4,

    m11 = te[0], m12 = te[4], m13 = te[8],
    m21 = te[1], m22 = te[5], m23 = te[9],
    m31 = te[2], m32 = te[6], m33 = te[10],

    trace = m11 + m22 + m33

  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0)
    target.set([(m32 - m23) * s, (m13 - m31) * s, (m21 - m12) * s, 0.25 / s])
  } else if (m11 > m22 && m11 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33)
    target.set([0.25 * s, (m12 + m21) / s, (m13 + m31) / s, (m32 - m23) / s])
  } else if (m22 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33)
    target.set([(m12 + m21) / s, 0.25 * s, (m23 + m32) / s, (m13 - m31) / s])
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22)
    target.set([(m13 + m31) / s, (m23 + m32) / s, 0.25 * s, (m21 - m12) / s])
  }
}
