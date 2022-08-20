import { spglslAngleCompile } from 'spglsl'

export async function replaceAsync(string, searchValue, replacer) {
  const values = []
  string.replace(searchValue, (...args) => {
    values.push(replacer(...args));
    return ''
  })

  const resolvedValues = await Promise.all(values)

  return string.replace(searchValue, () => resolvedValues.shift())
}

export async function minifyShaders (code) {
  return await replaceAsync(code, /"\/\*glsl\*\/([\s\S]+?)"/g, async shaderCode => {
    const s = JSON.parse(shaderCode)

    const precisionHeader = 'precision highp float;'
    const addPrecisionHeader = shaderCode.indexOf(precisionHeader) === -1

    const spgglslInput = addPrecisionHeader ? `${precisionHeader}\n${s}` : s

    const result = await spglslAngleCompile({
      compileMode: 'Optimize',
      mainSourceCode: spgglslInput,
      minify: true
    })
    if (!result.valid) {
      return JSON.stringify(
        s.substr(8)
          .replace(/\/\/.+/g, '')
          .replace(/\s+/g, ' ')
          .replace(/^\s+|\s+$/g, '')
          .replace(/\/\*[\s\S]+?\*\//g, '')
          .replace(/\b0(\.\d+)\b/g, (_, g1) => g1)
          .replace(/\b(\d+\.)0\b/g, (_, g1) => g1)
          .replace(/(\W) /g, (_, g1) => g1)
          .replace(/ (\W)/g, (_, g1) => g1)
      )
    } else {
      let output = result.output
      if (addPrecisionHeader) {
        output = output.replace(precisionHeader, '')
      }
      return JSON.stringify(output)
    }
  })
}
