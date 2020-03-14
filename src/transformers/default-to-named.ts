import { camelCase, pascalCase } from 'change-case';
import { ASTPath, ExportDefaultDeclaration } from 'jscodeshift/src/core';
import { basename, extname } from 'path';

export const exportNameFor = (defaultExport: ASTPath<ExportDefaultDeclaration>, path: string) => {
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