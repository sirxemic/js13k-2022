export function minifyMore (code) {
  return code
    .replace(/(?<!\w)\["(\w+)"\]:/g, (g0, g1) => g1 + ':')
    .replace(/(?<!\w)\[(\d+)\]:/g, (g0, g1) => g1 + ':')
    .replace(/window\.(\w+)/g, (g0, g1) => g1)
}
