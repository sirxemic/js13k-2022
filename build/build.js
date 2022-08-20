import { rollup } from 'rollup'
import fs from 'fs'
import rollupPluginJson from '@rollup/plugin-json'
import rollupPluginUrl from '@rollup/plugin-url'

import { setGameID } from './setGameID.js'
import { removeDevOnly } from './removeDevOnly.js'
import { ccMinify } from './ccMinify.js'
import { minifyMore } from './minifyMore.js'
import { minifyShaders } from './minifyShaders.js'
import { transformConstToLet } from './transformConstToLet.js'
import { transformGlConsts } from './transformGlConsts.js'
import { minifyHtml } from './minifyHtml.js'
import { zip } from './zip.js'

export async function build({ fixBeforeMinify, fixAfterHtmlMinify }) {
  const plugins = [
    rollupPluginJson(),
    rollupPluginUrl({
      limit: Infinity
    })
  ]

  const inputOptions = {
    input: 'src/entry.js',
    plugins
  }

  const outputOptions = {
    file: 'dist/build.js',
    format: 'es'
  }

  if (!fs.existsSync('dist')){
    fs.mkdirSync('dist')
  }

  const bundle = await rollup(inputOptions)
  const { output } = await bundle.generate(outputOptions)
  let code = output[0].code

  const postProcessFunctions = [
    setGameID,
    transformConstToLet,
    transformGlConsts,
    fixBeforeMinify,
    removeDevOnly,
    ccMinify,
    minifyMore,
    minifyShaders
  ]

  for (const func of postProcessFunctions) {
    // console.log('Code size:', code.length)
    // console.log(`Executing ${func.name}...`)
    code = await func(code)
  }

  // console.log('Code size:', code.length)
  // console.log(`Generating and minifying HTML...`)
  let minifiedHtml = fs.readFileSync('src/index.html', { encoding: 'utf-8' })
  minifiedHtml = minifyHtml(minifiedHtml)
  minifiedHtml = fixAfterHtmlMinify(minifiedHtml)

  let newScriptTag = `<script>${code.replace("'use strict';", '')}</script>`
  minifiedHtml = minifiedHtml
    .replace(/<script[^>]+><\/script>/, _ => newScriptTag)

  fs.writeFileSync('dist/index.html', minifiedHtml, { encoding: 'utf-8' })

  console.log('HTML bundle size:', minifiedHtml.length)
  console.log('Zipping...')

  await zip('dist/index.html', 'dist/dist.zip')

  const finalFileSize = fs.readFileSync('dist/dist.zip').byteLength

  const limit = 13 * 1024
  const perc = (finalFileSize * 100 / limit).toFixed(1)
  console.log(`Final file size: ${finalFileSize} (${perc}% of 13kb)`)

  if (finalFileSize > limit) {
    console.error(`That's ${finalFileSize - limit} too many bytes!`)
  } else {
    console.log(`${limit - finalFileSize} bytes left!`)
  }
}
