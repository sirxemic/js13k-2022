import { classNames } from './classNames.js'

// <dev-only>
for (let key in classNames) {
  classNames[key] = key
}
// </dev-only>

function getElement (name) {
  return document.querySelector('.' + name)
}

export const vrButton = getElement(classNames.vr)
export const startButton = getElement(classNames.desktop)
export const startScreen = getElement(classNames.startScreen)
export const loading = getElement(classNames.loading)
