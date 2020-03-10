import * as K from 'ast-types/gen/kinds';
import * as N from 'ast-types/gen/nodes';
import { API, ASTPath, ExportDefaultDeclaration, FileInfo, JSCodeshift, Options, StringLiteral } from 'jscodeshift/src/core';

export const DoNotTransform = undefined;
type DeclarationWithId = K.FunctionDeclarationKind | K.ClassDeclarationKind | K.TSInterfaceDeclarationKind

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);

  const getFirstNode = () => root.find(j.Program).get('body', 0).node;
  const originalFirstNode = getFirstNode();
  const comments = originalFirstNode.comments;

  root.find(j.ExportDefaultDeclaration).forEach(defaultExport => {
    const declarationType = defaultExport.value.declaration.type;
    const declaration = defaultExport.value.declaration;
    if (isExpressionKind(declaration)) {
      convertDefaultExportExpressionToNamedExport(j, declaration, defaultExport);
      return;
    }

    if (['FunctionDeclaration', 'ClassDeclaration'].includes(declaration.type)) {
      const f = declaration as DeclarationWithId;
      if (f.id === null) {

      }
    }
    if (isDeclarationKind(declaration)) {
      if (declaration.type === 'FunctionDeclaration') {
        const f = declaration as N.FunctionDeclaration;
        if (f.id === null) {
          f.id = j.identifier('exportName');
        }
      }
      const namedExportDeclaration = j.exportNamedDeclaration(declaration);
      j(defaultExport).replaceWith(namedExportDeclaration);
      return;
    }
    console.log('[skip] ' + declarationType);
  });

  const firstNodeAfterTransformation = getFirstNode();
  if (originalFirstNode !== firstNodeAfterTransformation) {
    firstNodeAfterTransformation.comments = comments;
  }

  return root.toSource({ quote: 'single' });
}

const isExpressionKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.ExpressionKind => {
  const expressionTypes = ['Identifier', 'FunctionExpression', 'ThisExpression', 'ArrayExpression', 'ObjectExpression', 'Literal', 'SequenceExpression', 'UnaryExpression', 'BinaryExpression', 'AssignmentExpression', 'UpdateExpression', 'LogicalExpression', 'ConditionalExpression', 'NewExpression', 'CallExpression', 'MemberExpression', 'ArrowFunctionExpression', 'YieldExpression', 'GeneratorExpression', 'ComprehensionExpression', 'ClassExpression', 'TaggedTemplateExpression', 'TemplateLiteral', 'AwaitExpression', 'JSXIdentifier', 'JSXExpressionContainer', 'JSXMemberExpression', 'JSXElement', 'JSXFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild', 'TypeCastExpression', 'DoExpression', 'Super', 'BindExpression', 'MetaProperty', 'ParenthesizedExpression', 'DirectiveLiteral', 'StringLiteral', 'NumericLiteral', 'BigIntLiteral', 'NullLiteral', 'BooleanLiteral', 'RegExpLiteral', 'PrivateName', 'Import', 'TSAsExpression', 'TSNonNullExpression', 'TSTypeParameter', 'TSTypeAssertion', 'OptionalMemberExpression', 'OptionalCallExpression'];
  return expressionTypes.includes(toCheck.type);
};

const convertDefaultExportExpressionToNamedExport = (j: JSCodeshift, declaration: K.ExpressionKind, defaultExport: ASTPath<ExportDefaultDeclaration>) => {
  const exportName = 'ExportName';
  const replacementDeclaration = j.variableDeclaration('const', [
    j.variableDeclarator(j.identifier(exportName), declaration)
  ]);
  j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
};

const isDeclarationKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.DeclarationKind => {
  const expressionTypes = ['ClassDeclaration', 'TSInterfaceDeclaration', 'FunctionDeclaration'];
  return expressionTypes.includes(toCheck.type);
};