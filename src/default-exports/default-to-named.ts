import * as K from 'ast-types/gen/kinds'
import { API } from 'jscodeshift'
import { dirname, resolve } from 'path'
import { replaceWithNamedExport } from './default-to-named-export'
import { DefaultFilesystem, Filesystem } from '../shared/filesystem'

export type ExportName = string
export type Importer = { path: string; importString: string }

/*
 if resolving imports becomes tedious have a look at https://github.com/dividab/tsconfig-paths
 */
export type ExportNameResolver = (importer: Importer, api: API, filesystem?: Filesystem) => ExportName

export const defaultExportNameResolver: ExportNameResolver = (
  importer: Importer,
  api: API,
  filesystem: Filesystem = new DefaultFilesystem(),
): ExportName => {
  const currentFileDirectory = dirname(resolve(importer.path))
  const absoluteImportTarget = resolve(currentFileDirectory, importer.importString)
  const pathToImportedFile = absoluteImportTarget + '.ts'
  const pathToImportedIndexFile = resolve(absoluteImportTarget, 'index.ts')
  const candidates = [pathToImportedFile, pathToImportedIndexFile]
  const foundFile = candidates.find((p) => filesystem.exists(p))

  if (foundFile === undefined) {
    throw new Error(`:( ${candidates}`)
  }
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
