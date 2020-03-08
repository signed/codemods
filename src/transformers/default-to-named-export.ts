import * as K from 'ast-types/gen/kinds';
import { API, FileInfo, Options, StringLiteral } from 'jscodeshift/src/core';

export const parser: string = 'ts';


const isExpressionKind = (toCheck: K.DeclarationKind | K.ExpressionKind): toCheck is K.ExpressionKind => {
  return ['StringLiteral', 'NumericLiteral'].includes(toCheck.type);
};

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  const getFirstNode = () => root.find(j.Program).get('body', 0).node;
  const originalFirstNode = getFirstNode();
  const comments = originalFirstNode.comments;

  root.find(j.ExportDefaultDeclaration).forEach(defaultExport => {
    const declarationType = defaultExport.value.declaration.type;
    const declaration = defaultExport.value.declaration;
    if (!isExpressionKind(declaration)) {
      console.log('[skip] ' + declarationType);
      return;
    }
    const exportName = 'ExportName';
    const replacementDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier(exportName), declaration)
    ]);

    j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
  });

  const firstNodeAfterTransformation = getFirstNode();
  if (originalFirstNode !== firstNodeAfterTransformation) {
    firstNodeAfterTransformation.comments = comments;
  }

  return root.toSource({ quote: 'single' });
}
