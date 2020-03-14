import { camelCase, pascalCase } from 'change-case';
import { ASTPath, ExportDefaultDeclaration } from 'jscodeshift/src/core';
import { basename, extname } from 'path';

export type ExportName = string;
export type Importer = {};
export type Exporter = {};

/*
 if resolving imports becomes tedious have a look at https://github.com/dividab/tsconfig-paths
 */
export type ExportNameResolver = (importer: Importer, exporter: Exporter) => ExportName

export const defaultExportNameResolver: ExportNameResolver = (): ExportName => {
  return 'StandInExportName';
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