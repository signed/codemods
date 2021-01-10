import { API, FileInfo, Options } from 'jscodeshift/src/core'
import { extractImportString } from '../shared/imports'
import { DoNotTransform } from '../shared/jscodeshift-constants'
import { fileExtensionFrom } from '../shared/paths'

export const parser: string = 'ts'

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, options: Options) => transform(file, api, options)

export const transform = (file: FileInfo, api: API, options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform
  }
  const j = api.jscodeshift.withParser(fileExtensionFrom(file.path))
  const root = j(file.source)
  const importsToUpdate = root.find(api.j.ImportDeclaration).filter(importDeclaration => {
    const importString = extractImportString(importDeclaration.value)
    return importString.startsWith(options.toReplace)
  })
  if (importsToUpdate.length === 0) {
    return DoNotTransform
  }
  importsToUpdate.forEach(importPath => {
    const source = importPath.value.source
    if (source.type === 'StringLiteral') {
      source.value = source.value.replace(options.toReplace, options.replacement)
    }
  })
  return root.toSource({ quote: 'single' })
}
