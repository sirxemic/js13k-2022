import packageJson from '../package.json'

export function setGameID (code) {
  return code.replace('GAME_ID', JSON.stringify(`${packageJson.author}_${packageJson.name}`))
}
