import { minify } from 'html-minifier'
import { classNames } from '../src/classNames.js'

export function minifyHtml (html) {
  let minifiedHtml = minify(
    html,
    {
      collapseWhitespace: true,
      minifyCSS: true,
      removeAttributeQuotes: true,
      removeOptionalTags: true
    }
  )

  Object.entries(classNames).forEach(([key, value]) => {
    minifiedHtml = minifiedHtml.replace(new RegExp(`\\b${key}\\b`, 'g'), value)
  })

  return minifiedHtml
}
