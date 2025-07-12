import * as K from 'ast-types/lib/gen/kinds'
import { API } from 'jscodeshift'
import { DefaultFilesystem, Filesystem } from '../shared/filesystem'
import { Importer, pathToImportedSourceFile } from '../shared/paths'
import { replaceWithNamedExport } from './default-to-named-export'

export type ExportName = string
export type ExportNameResolver = (importer: Importer, api: API, filesystem?: Filesystem) => ExportName

export const defaultExportNameResolver: ExportNameResolver = (
  importer: Importer,
  api: API,
  filesystem: Filesystem = new DefaultFilesystem(),
): ExportName => {
  const foundFile = pathToImportedSourceFile(importer, filesystem)
  const file = {
    path: foundFile,
    source: filesystem.readFileAsString(foundFile),
  }
  const result = replaceWithNamedExport(api.jscodeshift(file.source), api.jscodeshift, file)
  return result.identifier
}

type MaybeAnonymousDefaultExportDeclarations = K.FunctionDeclarationKind | K.ClassDeclarationKind

export const isDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.DeclarationKind => {
  const expressionTypes = ['TSInterfaceDeclaration']
  return expressionTypes.includes(toCheck.type) || isMaybeAnonymousDeclarationKind(toCheck)
}

export const isMaybeAnonymousDeclarationKind = (
  toCheck: K.DeclarationKind | K.ExpressionKind,
): toCheck is MaybeAnonymousDefaultExportDeclarations => {
  return ['FunctionDeclaration', 'ClassDeclaration'].includes(toCheck.type)
}

export const isIdentifierKind = (toCheck: K.ExpressionKind): toCheck is K.IdentifierKind => {
  return toCheck.type === 'Identifier'
}
