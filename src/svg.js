export function svg (width, height, ...content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${content.join('')}</svg>`
}

export function text (text, color, x, y) {
  return `<text style="font:900 120px system-ui" fill="${color}" text-anchor="middle" x="${x}" y="${y}">${text}</text>`
}

export function radialGradient (stops, name) {
  return `<radialGradient id="${name}">${stops.map(([offset, color]) => `<stop offset="${offset}%" stop-color="${color}"/>`)}</radialGradient>`
}

export function displacementNoise (freq, octaves, scale, name) {
  return `<filter id="${name}">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" result="t"/>` +
    `<feDisplacementMap in2="t" in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />` +
  `</filter>`
}

export async function getImageDataFromSvgCode (code) {
  const img = new Image(1024, 1024)
  img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(code)

  await new Promise(resolve => { img.onload = resolve })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 1024
  canvas.height = 1024
  ctx.drawImage(img, 0, 0, 1024, 1024)

  return canvas
}
