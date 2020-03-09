import * as K from 'ast-types/gen/kinds';
import { API, ASTPath, ExportDefaultDeclaration, FileInfo, JSCodeshift, Options, StringLiteral } from 'jscodeshift/src/core';

export const DoNotTransform = undefined;

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

    if (['ClassDeclaration', 'TSInterfaceDeclaration', 'FunctionDeclaration'].includes(declaration.type)) {
      const namedExportDeclaration = j.exportNamedDeclaration(declaration as K.DeclarationKind);
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
