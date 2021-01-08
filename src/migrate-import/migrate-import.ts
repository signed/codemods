import { API, FileInfo, Options } from 'jscodeshift/src/core'

export const parser: string = 'ts'

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, options: Options) => transform(file, api, options)

export const transform = (file: FileInfo, api: API, options: Options) => {
  const j = api.jscodeshift
  const root = j(file.source)
  root.find(api.j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: options.toReplace,
    },
  }).forEach(importPath => {
    const importDeclaration = importPath.value
    const source = importDeclaration.source
    if (source.type === 'StringLiteral') {
      source.value = options.replacement
    }
  })
  return root.toSource({ quote: 'single' })
}
