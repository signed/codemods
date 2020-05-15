import { camelCase, pascalCase } from 'change-case';
import { API, ASTPath, ExportDefaultDeclaration } from 'jscodeshift/src/core';
import { basename, dirname, extname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

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
  const defaultExports = root.find(j.ExportDefaultDeclaration);
  const defaultExport = defaultExports.paths()[0];

  if (defaultExport === undefined) {
    return 'StandInExportName';
  }
  return exportNameFor(defaultExport, pathToImportedFile);
};

export const exportNameFor = (defaultExport: ASTPath<ExportDefaultDeclaration>, path: string): ExportName => {
  const type = defaultExport.value.declaration.type;
  const filename = basename(path, extname(path));
  switch (type) {
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      return camelCase(filename);
    default:
      return pascalCase(filename);
  }
};