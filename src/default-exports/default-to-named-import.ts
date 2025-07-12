import {
  API,
  ASTPath,
  FileInfo,
  Identifier,
  Options,
  ImportDeclaration,
  ImportSpecifier,
  ImportDefaultSpecifier,
} from 'jscodeshift'
import { extractImportString } from '../shared/imports'
import { isTSTypeParameter } from '../shared/typeguards'
import { defaultExportNameResolver, ExportNameResolver } from './default-to-named'
import { DoNotTransform } from '../shared/jscodeshift-constants'
import { isImportToSourceFileInProject } from '../shared/shared'

export const parser: string = 'ts'
export default (file: FileInfo, api: API, _options: Options) =>
  transform(file, api, _options, defaultExportNameResolver)

export const transform = (file: FileInfo, api: API, _options: Options, exportNameResolver: ExportNameResolver) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform
  }
  const root = api.j(file.source)

  const changeImportToAdjustForRemovedDefaultExport = (
    renamedDefaultImport: ASTPath<ImportDeclaration>,
    importSpecifier: ASTPath<ImportSpecifier> | ASTPath<ImportDefaultSpecifier>,
  ) => {
    const importString = extractImportString(renamedDefaultImport.node)
    if (!isImportToSourceFileInProject(importString)) {
      return
    }
    const exportName = exportNameResolver({ path: file.path, importString }, api)
    const local = importSpecifier.value.local

    let localNameIdentifier: Identifier | null = null
    if (local !== undefined && local !== null && !isTSTypeParameter(local)) {
      const localName = local.name
      if (localName !== exportName) {
        localNameIdentifier = api.j.identifier(localName)
      }
    }
    importSpecifier.replace(api.j.importSpecifier(api.j.identifier(exportName), localNameIdentifier))
  }

  root.find(api.j.ImportDeclaration).forEach((importDeclaration) => {
    api
      .j(importDeclaration)
      .find(api.j.ImportDefaultSpecifier)
      .forEach((importDefaultSpecifier) =>
        changeImportToAdjustForRemovedDefaultExport(importDeclaration, importDefaultSpecifier),
      )
    api
      .j(importDeclaration)
      .find(api.j.ImportSpecifier, {
        type: 'ImportSpecifier',
        imported: {
          type: 'Identifier',
          name: 'default',
        },
      })
      .forEach((importSpecifier) => changeImportToAdjustForRemovedDefaultExport(importDeclaration, importSpecifier))
  })
  return root.toSource({ quote: 'single' })
}
