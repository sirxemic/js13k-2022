export function transformConstToLet (code) {
  return code.replace(/\bconst\b/g, 'let')
}