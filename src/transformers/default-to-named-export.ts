import * as K from 'ast-types/gen/kinds';
import { camelCase, pascalCase } from 'change-case';
import { Collection } from 'jscodeshift/src/Collection';
import { API, ASTPath, ExportDefaultDeclaration, FileInfo, Identifier, JSCodeshift, NewExpression, Options, StringLiteral } from 'jscodeshift/src/core';
import { basename, extname } from 'path';
import { ExportName, isDeclarationKind, isMaybeAnonymousDeclarationKind } from './default-to-named';
import { DoNotTransform } from './jscodeshift-constants';
import { preserveCommentAtStartOfFile } from './shared';

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export const transform = (file: FileInfo, api: API, _options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);

  if (root.find(j.ExportDefaultDeclaration).size() === 0) {
    return DoNotTransform;
  }

  preserveCommentAtStartOfFile(root, j, () => {
    replaceWithNamedExport(root, j, file);
  });

  return root.toSource({ quote: 'single' });
};
export default transform;

type NamedExport = { identifier: string };

export const replaceWithNamedExport = (root: Collection<any>, j: JSCodeshift, file: FileInfo): NamedExport => {
  const defaultExport: ASTPath<ExportDefaultDeclaration> = root.find(j.ExportDefaultDeclaration).paths()[0];
  const exportName = exportNameFor(defaultExport, file.path);
  const declaration = defaultExport.value.declaration;
  if (isIdentifierKind(declaration)) {
    return removeAliasDefaultExport(root, j, declaration, defaultExport);
  }
  if (isExpressionKind(declaration)) {
    const replacementDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier(exportName), declaration)
    ]);
    j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
    return {
      identifier: exportName
    };
  }
  if (isDeclarationKind(declaration)) {
    let identifier = exportName;
    if (isMaybeAnonymousDeclarationKind(declaration)) {
      if (declaration.id === null) {
        declaration.id = j.identifier(exportName);
      } else {
        identifier = declaration.id.name;
      }
    }
    j(defaultExport).replaceWith(j.exportNamedDeclaration(declaration));
    return {
      identifier
    };
  }
  throw new Error('[skip] ' + defaultExport.value.declaration.type);
};

const removeAliasDefaultExport = (root: Collection<any>, j: JSCodeshift, declaration: K.IdentifierKind, defaultExport: ASTPath<ExportDefaultDeclaration>): NamedExport => {
  const identifiers = root.find(j.VariableDeclarator, {
    id: {
      type: 'Identifier',
      name: declaration.name
    }
  });
  if (identifiers.size() !== 1) {
    throw new Error('There is more than one place the exported default identifier is declared, have to take care of this');
  }
  const path = identifiers.paths()[0];
  if (!path.scope.isGlobal) {
    throw new Error('Not global, have a look at the code');
  }
  const banana = j(path);
  const exportNamedDeclarationCollection = banana.closest(j.ExportNamedDeclaration);
  const isExported = exportNamedDeclarationCollection.size() === 1;
  if (!isExported) {
    const declaration = banana.closest(j.VariableDeclaration);
    if (declaration.size() !== 1) {
      throw new Error('have a look at the code');
    }
    const path1 = declaration.paths()[0];
    const updated = j.exportNamedDeclaration(path1.value);
    declaration.replaceWith(updated);
  }

  j(defaultExport).replaceWith([]);
  return {
    identifier: declaration.name
  };
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

const isIdentifierKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.IdentifierKind => {
  return toCheck.type === 'Identifier';
};

const isExpressionKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.ExpressionKind => {
  const expressionTypes = ['Identifier', 'FunctionExpression', 'ThisExpression', 'ArrayExpression', 'ObjectExpression', 'Literal', 'SequenceExpression', 'UnaryExpression', 'BinaryExpression', 'AssignmentExpression', 'UpdateExpression', 'LogicalExpression', 'ConditionalExpression', 'NewExpression', 'CallExpression', 'MemberExpression', 'ArrowFunctionExpression', 'YieldExpression', 'GeneratorExpression', 'ComprehensionExpression', 'ClassExpression', 'TaggedTemplateExpression', 'TemplateLiteral', 'AwaitExpression', 'JSXIdentifier', 'JSXExpressionContainer', 'JSXMemberExpression', 'JSXElement', 'JSXFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild', 'TypeCastExpression', 'DoExpression', 'Super', 'BindExpression', 'MetaProperty', 'ParenthesizedExpression', 'DirectiveLiteral', 'StringLiteral', 'NumericLiteral', 'BigIntLiteral', 'NullLiteral', 'BooleanLiteral', 'RegExpLiteral', 'PrivateName', 'Import', 'TSAsExpression', 'TSNonNullExpression', 'TSTypeParameter', 'TSTypeAssertion', 'OptionalMemberExpression', 'OptionalCallExpression'];
  return expressionTypes.includes(toCheck.type);
};
