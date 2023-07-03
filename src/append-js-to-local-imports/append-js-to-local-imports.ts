import type { API, ExportNamedDeclaration, FileInfo, ImportDeclaration, Options } from 'jscodeshift'
import { extractReferencedFileStringFrom } from '../shared/file-references'
import { DefaultFilesystem, Filesystem } from '../shared/filesystem'
import { extractImportString } from '../shared/imports'
import { DoNotTransform } from '../shared/jscodeshift-constants'
import { fileExtensionFrom, Importer, pathToImportedSourceFile } from '../shared/paths'
import { isImportToSourceFileInProject } from '../shared/shared'
import { isPresent } from '../shared/utils'

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
    const node = importDeclaration.node
    const importString = extractImportString(node)
    if (!isImportToSourceFileInProject(importString)) {
      return
    }
    ensureJsExtension(node, importString, isDirectoryImport, file, api)
  })
  root.find(api.j.ExportNamedDeclaration).forEach((namedExportDeclaration) => {
    const node = namedExportDeclaration.node
    const exportSource = node.source
    if (!isPresent(exportSource)) {
      return
    }
    const importString = extractReferencedFileStringFrom(exportSource)
    if (!isImportToSourceFileInProject(importString)) {
      return
    }
    ensureJsExtension(node, importString, isDirectoryImport, file, api)
  })
  return root.toSource({ quote: 'single' })
}

const ensureJsExtension = (
  node: ImportDeclaration | ExportNamedDeclaration,
  importString: string,
  isDirectoryImport: IsDirectoryImport,
  file: FileInfo,
  api: API,
) => {
  if (importString.endsWith('.js')) {
    return
  }
  const indexTsImport = isDirectoryImport({ path: file.path, importString: importString })
  if (node.source?.type === 'StringLiteral') {
    const value = node.source.value
    if (indexTsImport) {
      node.source = api.j.stringLiteral(value + '/index.js')
    } else {
      node.source = api.j.stringLiteral(value + '.js')
    }
  }
}
