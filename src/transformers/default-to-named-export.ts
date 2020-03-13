import * as K from 'ast-types/gen/kinds';
import { camelCase, pascalCase } from 'change-case';
import { API, ASTPath, ExportDefaultDeclaration, FileInfo, JSCodeshift, Options, StringLiteral } from 'jscodeshift/src/core';
import { basename, extname } from 'path';

export const DoNotTransform = undefined;
type MaybeAnonymousDefaultExportDeclarations = K.FunctionDeclarationKind | K.ClassDeclarationKind

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export const transform = (file: FileInfo, api: API, _options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);

  const banana = root.find(j.ExportDefaultDeclaration);
  if (banana.size() === 0) {
    return DoNotTransform;
  }
  const getFirstNode = () => root.find(j.Program).get('body', 0).node;
  const originalFirstNode = getFirstNode();
  const comments = originalFirstNode.comments;

  const defaultExport: ASTPath<ExportDefaultDeclaration> = banana.paths()[0];
  replaceWithNamedExport(defaultExport, j, file);

  const firstNodeAfterTransformation = getFirstNode();
  if (originalFirstNode !== firstNodeAfterTransformation) {
    firstNodeAfterTransformation.comments = comments;
  }

  return root.toSource({ quote: 'single' });
};
export default transform

const replaceWithNamedExport = (defaultExport: ASTPath<ExportDefaultDeclaration>, j: JSCodeshift, file: FileInfo) => {
  const declarationType = defaultExport.value.declaration.type;
  const declaration = defaultExport.value.declaration;
  if (isExpressionKind(declaration)) {
    convertDefaultExportExpressionToNamedExport(j, declaration, defaultExport, file.path);
    return;
  }

  if (isDeclarationKind(declaration)) {
    if (isMaybeAnonymousDeclarationKind(declaration)) {
      const f = declaration;
      if (f.id === null) {
        f.id = j.identifier(exportNameFor(declaration.type, file.path));
      }
    }
    const namedExportDeclaration = j.exportNamedDeclaration(declaration);
    j(defaultExport).replaceWith(namedExportDeclaration);
    return;
  }
  console.log('[skip] ' + declarationType);
};

const isExpressionKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.ExpressionKind => {
  const expressionTypes = ['Identifier', 'FunctionExpression', 'ThisExpression', 'ArrayExpression', 'ObjectExpression', 'Literal', 'SequenceExpression', 'UnaryExpression', 'BinaryExpression', 'AssignmentExpression', 'UpdateExpression', 'LogicalExpression', 'ConditionalExpression', 'NewExpression', 'CallExpression', 'MemberExpression', 'ArrowFunctionExpression', 'YieldExpression', 'GeneratorExpression', 'ComprehensionExpression', 'ClassExpression', 'TaggedTemplateExpression', 'TemplateLiteral', 'AwaitExpression', 'JSXIdentifier', 'JSXExpressionContainer', 'JSXMemberExpression', 'JSXElement', 'JSXFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild', 'TypeCastExpression', 'DoExpression', 'Super', 'BindExpression', 'MetaProperty', 'ParenthesizedExpression', 'DirectiveLiteral', 'StringLiteral', 'NumericLiteral', 'BigIntLiteral', 'NullLiteral', 'BooleanLiteral', 'RegExpLiteral', 'PrivateName', 'Import', 'TSAsExpression', 'TSNonNullExpression', 'TSTypeParameter', 'TSTypeAssertion', 'OptionalMemberExpression', 'OptionalCallExpression'];
  return expressionTypes.includes(toCheck.type);
};

const convertDefaultExportExpressionToNamedExport = (j: JSCodeshift, declaration: K.ExpressionKind, defaultExport: ASTPath<ExportDefaultDeclaration>, path: string) => {
  const exportName = exportNameFor(declaration.type, path);
  const replacementDeclaration = j.variableDeclaration('const', [
    j.variableDeclarator(j.identifier(exportName), declaration)
  ]);
  j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
};

const isDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.DeclarationKind => {
  const expressionTypes = ['TSInterfaceDeclaration'];
  return expressionTypes.includes(toCheck.type) || isMaybeAnonymousDeclarationKind(toCheck);
};

const isMaybeAnonymousDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is MaybeAnonymousDefaultExportDeclarations => {
  return ['FunctionDeclaration', 'ClassDeclaration'].includes(toCheck.type);
};

const exportNameFor = (type: string, path: string): string => {
  const filename = basename(path, extname(path));
  switch (type) {
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      return camelCase(filename);
    default:
      return pascalCase(filename);
  }
};