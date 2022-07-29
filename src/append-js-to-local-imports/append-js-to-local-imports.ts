import type { API, FileInfo, Options } from 'jscodeshift'
import { DefaultFilesystem, Filesystem } from '../shared/filesystem'
import { extractImportString } from '../shared/imports'
import { DoNotTransform } from '../shared/jscodeshift-constants'
import { fileExtensionFrom, Importer, pathToImportedSourceFile } from '../shared/paths'
import { isImportToSourceFileInProject } from '../shared/shared'

export const parser: string = 'ts'

type IsDirectoryImport = (importer: Importer, filesystem?: Filesystem) => boolean

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options, defaultIsDirectoryImport)

export const defaultIsDirectoryImport = (importer: Importer, filesystem: Filesystem = new DefaultFilesystem()) => {
  if (importer.importString.endsWith('/index')) {
    return false
  }
  const path = pathToImportedSourceFile(importer, filesystem)
  return path.endsWith('index.ts')
}

export const transform = (file: FileInfo, api: API, _options: Options, isDirectoryImport: IsDirectoryImport) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform
  }
  const j = api.jscodeshift.withParser(fileExtensionFrom(file.path))
  const root = j(file.source)
  root.find(api.j.ImportDeclaration).forEach((importDeclaration) => {
    const importString = extractImportString(importDeclaration.node)
    if (!isImportToSourceFileInProject(importString)) {
      return
    }
    if (importString.endsWith('.js')) {
      return
    }

    const indexTsImport = isDirectoryImport({path: file.path, importString: importString})
    if (importDeclaration.node.source.type === 'StringLiteral') {
      const value = importDeclaration.node.source.value
      if (indexTsImport) {
        importDeclaration.node.source = api.j.stringLiteral(value + '/index.js')
      } else {
        importDeclaration.node.source = api.j.stringLiteral(value + '.js')
      }
    }
  })
  return root.toSource({ quote: 'single' })
}
