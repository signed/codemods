import * as K from 'ast-types/gen/kinds';
import { API, ASTPath, ExportDefaultDeclaration, FileInfo, JSCodeshift, Options, StringLiteral } from 'jscodeshift/src/core';
import { exportNameFor, isDeclarationKind, isMaybeAnonymousDeclarationKind } from './default-to-named';
import { DoNotTransform } from './jscodeshift-constants';

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export const transform = (file: FileInfo, api: API, _options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);

  const defaultExports = root.find(j.ExportDefaultDeclaration);
  if (defaultExports.size() === 0) {
    return DoNotTransform;
  }
  const getFirstNode = () => root.find(j.Program).get('body', 0).node;
  const originalFirstNode = getFirstNode();
  const comments = originalFirstNode.comments;

  const defaultExport: ASTPath<ExportDefaultDeclaration> = defaultExports.paths()[0];
  const exportName = exportNameFor(defaultExport, file.path);
  const declaration = defaultExport.value.declaration;
  if (isIdentifierKind(declaration)) {
    const identifiers = root.find(j.VariableDeclarator, {
      id: {
        type: 'Identifier',
        name: declaration.name
      }
    });
    if (identifiers.size() !== 1) {
      throw new Error('There is more than one place the exported default identifier is declared, have to take care of this')
    }
    const path = identifiers.paths()[0];
    if( !path.scope.isGlobal ) {
      throw new Error('Not global, have a look at the code')
    }
    const banana = j(path);
    const exportNamedDeclarationCollection = banana.closest(j.ExportNamedDeclaration);
    const isExported = exportNamedDeclarationCollection.size() === 1
    if (!isExported) {
      const declaration = banana.closest(j.VariableDeclaration);
      if (declaration.size() !== 1) {
        throw new Error('have a look at the code')
      }
      const path1 = declaration.paths()[0];
      const updated = j.exportNamedDeclaration(path1.value);
      declaration.replaceWith(updated)
    }

    j(defaultExport).replaceWith([]);
  } else {
    replaceWithNamedExport(defaultExport, exportName, j);
  }

  const firstNodeAfterTransformation = getFirstNode();
  if (originalFirstNode !== firstNodeAfterTransformation) {
    firstNodeAfterTransformation.comments = comments;
  }

  return root.toSource({ quote: 'single' });
};
export default transform;

const replaceWithNamedExport = (defaultExport: ASTPath<ExportDefaultDeclaration>, exportName: string, j: JSCodeshift) => {
  const declaration = defaultExport.value.declaration;
  if (isExpressionKind(declaration)) {
    const replacementDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier(exportName), declaration)
    ]);
    j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
    return;
  }
  if (isDeclarationKind(declaration)) {
    if (isMaybeAnonymousDeclarationKind(declaration)) {
      if (declaration.id === null) {
        declaration.id = j.identifier(exportName);
      }
    }
    j(defaultExport).replaceWith(j.exportNamedDeclaration(declaration));
    return;
  }
  console.log('[skip] ' + defaultExport.value.declaration.type);
};

const isIdentifierKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.IdentifierKind => {
  return toCheck.type === 'Identifier';
};

const isExpressionKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.ExpressionKind => {
  const expressionTypes = ['Identifier', 'FunctionExpression', 'ThisExpression', 'ArrayExpression', 'ObjectExpression', 'Literal', 'SequenceExpression', 'UnaryExpression', 'BinaryExpression', 'AssignmentExpression', 'UpdateExpression', 'LogicalExpression', 'ConditionalExpression', 'NewExpression', 'CallExpression', 'MemberExpression', 'ArrowFunctionExpression', 'YieldExpression', 'GeneratorExpression', 'ComprehensionExpression', 'ClassExpression', 'TaggedTemplateExpression', 'TemplateLiteral', 'AwaitExpression', 'JSXIdentifier', 'JSXExpressionContainer', 'JSXMemberExpression', 'JSXElement', 'JSXFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild', 'TypeCastExpression', 'DoExpression', 'Super', 'BindExpression', 'MetaProperty', 'ParenthesizedExpression', 'DirectiveLiteral', 'StringLiteral', 'NumericLiteral', 'BigIntLiteral', 'NullLiteral', 'BooleanLiteral', 'RegExpLiteral', 'PrivateName', 'Import', 'TSAsExpression', 'TSNonNullExpression', 'TSTypeParameter', 'TSTypeAssertion', 'OptionalMemberExpression', 'OptionalCallExpression'];
  return expressionTypes.includes(toCheck.type);
};
