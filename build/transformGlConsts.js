import webglConstants from '@luma.gl/constants'

export function transformGlConsts (code) {
  for (let [key, value] of Object.entries(webglConstants)) {
    code = code.replace(new RegExp(`([^a-zA-Z.])gl\\.${key}\\b`, 'g'), (g0, g1) => g1 + value)
  }
  return code
}