import fs from 'fs'
import tempfile from 'tempfile'
import googleClosureCompiler from 'google-closure-compiler'

function asyncCompile (compiler) {
  return new Promise(resolve => compiler.run((...args) => resolve(args)))
}

export async function ccMinify (code) {
  const jsFilename = tempfile()
  const mapFilename = tempfile()

  fs.writeFileSync(jsFilename, code)

  const compiler = new googleClosureCompiler.compiler({
    js: jsFilename,
    create_source_map: mapFilename,
    process_common_js_modules: true,
    language_out: 'ECMASCRIPT_NEXT',
    compilation_level: 'ADVANCED'
  })

  const [exitCode, stdOut, stdErr] = await asyncCompile(compiler)

  if (exitCode !== 0) {
    throw new Error(`closure compiler exited ${exitCode}: ${stdErr}`)
  }

  return stdOut
}
