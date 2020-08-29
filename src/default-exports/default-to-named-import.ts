import * as K from 'ast-types/gen/kinds'
import * as N from 'ast-types/gen/nodes'
import { API, ASTPath, FileInfo, Identifier, ImportDeclaration, Options, StringLiteral } from 'jscodeshift/src/core'
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
    renamedDefaultImport: ASTPath<N.ImportDeclaration>,
    importSpecifier: ASTPath<N.ImportSpecifier> | ASTPath<N.ImportDefaultSpecifier>,
  ) => {
    const importString = extractImportString(renamedDefaultImport.node)
    if (!isImportToSourceFileInProject(importString)) {
      return
    }
    const exportName = exportNameResolver({ path: file.path, importString }, api)
    const localName = importSpecifier.value.local?.name
    let localNameIdentifier: Identifier | null = null
    if (localName !== undefined && localName !== exportName) {
      localNameIdentifier = api.j.identifier(localName)
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

const extractImportString = (importDeclaration: ImportDeclaration): string => {
  let source = importDeclaration.source
  if (isStringLiteral(source)) {
    return source.value
  }
  if (isLiteral(source) && typeof source.value === 'string') {
    return source.value
  }
  throw new Error(`Unable to extract import string from import declaration of source type ${source.type}`)
}

const isStringLiteral = (toCheck: K.LiteralKind): toCheck is K.StringLiteralKind => {
  return toCheck.type === 'StringLiteral'
}

const isLiteral = (toCheck: K.LiteralKind): toCheck is N.Literal => {
  return toCheck.type === 'Literal'
}
