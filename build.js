import { build } from './build/build.js'

build({
  // Rename certain words and rewrite patterns which closure compiler usually doesn't mangle, such that
  // it actually does mangle them.
  fixBeforeMinify (code) {
    return code
  },

  // Hack: undo some renaming :P
  fixAfterHtmlMinify (html) {
    return html.replace('orientation||0', 'window.orientation||screen.orientation.angle||0')
  }
})
