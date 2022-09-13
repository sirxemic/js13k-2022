export function transformConstToLet (code) {
  return code
    .replace(/\bconst\b/g, 'let')
    .replace(/\blet vec/g, 'const vec') // consts in glsl
}
