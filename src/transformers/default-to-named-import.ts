import * as K from 'ast-types/gen/kinds';
import * as N from 'ast-types/gen/nodes';
import { API, FileInfo, Identifier, ImportDeclaration, Options, StringLiteral } from 'jscodeshift/src/core';
import { defaultExportNameResolver, ExportNameResolver } from './default-to-named';
import { DoNotTransform } from './jscodeshift-constants';
import { isImportToSourceFileInProject } from './shared';

export const parser: string = 'ts';
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options, defaultExportNameResolver);

export const transform = (file: FileInfo, api: API, _options: Options, exportNameResolver: ExportNameResolver) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ImportDeclaration, {
    specifiers: [{
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: 'default'
      }
    }]
  }).forEach(renamedDefaultImport => {
    j(renamedDefaultImport).find(j.ImportSpecifier).forEach(importSpecifier => {
      const importString = extractImportString(renamedDefaultImport.node);
      if (!isImportToSourceFileInProject(importString)) {
        return;
      }
      const exportName = exportNameResolver({ path: file.path, importString }, api);
      const localName = importSpecifier.value.local?.name;
      let localNameIdentifier: Identifier | null = null;
      if (localName !== undefined && localName !== exportName) {
        localNameIdentifier = j.identifier(localName);
      }
      importSpecifier.replace(j.importSpecifier(j.identifier(exportName), localNameIdentifier));
    });
  });

  root.find(j.ImportDeclaration).forEach(importDeclaration => {
    j(importDeclaration).find(j.ImportDefaultSpecifier).forEach((defaultImport) => {
      const importString = extractImportString(importDeclaration.node);
      if (!isImportToSourceFileInProject(importString)) {
        return;
      }
      const exportName = exportNameResolver({ path: file.path, importString }, api);
      const localName = defaultImport.value.local?.name;
      let localNameIdentifier: Identifier | null = null;
      if (localName !== undefined && localName !== exportName) {
        localNameIdentifier = j.identifier(localName);
      }
      defaultImport.replace(j.importSpecifier(j.identifier(exportName), localNameIdentifier));
    });
  });
  return root.toSource({ quote: 'single' });
};

const extractImportString = (importDeclaration: ImportDeclaration): string => {
  let source = importDeclaration.source;
  if (isStringLiteral(source)) {
    return source.value;
  }
  if (isLiteral(source) && typeof source.value === 'string') {
    return source.value;
  }
  throw new Error(`Unable to extract import string from import declaration of source type ${source.type}`);
};

const isStringLiteral = (toCheck: K.LiteralKind): toCheck is K.StringLiteralKind => {
  return toCheck.type === 'StringLiteral';
};

const isLiteral = (toCheck: K.LiteralKind): toCheck is N.Literal => {
  return toCheck.type === 'Literal';
};
