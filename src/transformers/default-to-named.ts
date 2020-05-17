import * as K from 'ast-types/gen/kinds';
import { camelCase, pascalCase } from 'change-case';
import { existsSync, readFileSync } from 'fs';
import { API, ASTPath, ExportDefaultDeclaration, NewExpression } from 'jscodeshift/src/core';
import { basename, dirname, extname, resolve } from 'path';
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

  const importSource = readFileSync(pathToImportedFile, { encoding: 'utf8' });
  const j = api.jscodeshift;
  const root = j(importSource);
  const result = replaceWithNamedExport(root, j, { path: importer.path, source: importSource });
  return result.identifier;
};

export const exportNameFor = (defaultExport: ASTPath<ExportDefaultDeclaration>, path: string): ExportName => {
  const type = defaultExport.value.declaration.type;
  const filename = basename(path, extname(path));
  switch (type) {
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      return camelCase(filename);
    case 'NewExpression':
      const newExpression = defaultExport.value.declaration as NewExpression;
      const callee = newExpression.callee;
      if (isIdentifierKind(callee)) {
        return camelCase(callee.name + 'Singleton');
      }
      throw new Error('NewExpression of type ' + callee.type);
    default:
      return pascalCase(filename);
  }
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