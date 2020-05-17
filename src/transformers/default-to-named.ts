import * as K from 'ast-types/gen/kinds';
import { existsSync, readFileSync } from 'fs';
import { API } from 'jscodeshift/src/core';
import { dirname, resolve } from 'path';
import { replaceWithNamedExport } from './default-to-named-export';

export type ExportName = string;
export type Importer = { path: string, importString: string };

/*
 if resolving imports becomes tedious have a look at https://github.com/dividab/tsconfig-paths
 */
export type ExportNameResolver = (importer: Importer, api: API) => ExportName

export const defaultExportNameResolver: ExportNameResolver = (importer: Importer, api: API): ExportName => {
  const currentFileDirectory = dirname(resolve(importer.path));
  const absoluteImportTarget = resolve(currentFileDirectory, importer.importString);
  const pathToImportedFile = absoluteImportTarget + '.ts';

  if (!existsSync(pathToImportedFile)) {
    throw new Error(`:( ${pathToImportedFile}`);
  }
  const root = api.jscodeshift(readFileSync(pathToImportedFile, { encoding: 'utf8' }));
  const result = replaceWithNamedExport(root, api.jscodeshift, { path: pathToImportedFile, source: readFileSync(pathToImportedFile, { encoding: 'utf8' }) });
  return result.identifier;
};

type MaybeAnonymousDefaultExportDeclarations = K.FunctionDeclarationKind | K.ClassDeclarationKind

export const isDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.DeclarationKind => {
  const expressionTypes = ['TSInterfaceDeclaration'];
  return expressionTypes.includes(toCheck.type) || isMaybeAnonymousDeclarationKind(toCheck);
};

export const isMaybeAnonymousDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is MaybeAnonymousDefaultExportDeclarations => {
  return ['FunctionDeclaration', 'ClassDeclaration'].includes(toCheck.type);
};

export const isIdentifierKind = (toCheck: K.ExpressionKind): toCheck is K.IdentifierKind => {
  return toCheck.type === 'Identifier';
};