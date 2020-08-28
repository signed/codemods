import { ExportNamedDeclaration, Identifier, VariableDeclaration } from 'ast-types/gen/nodes';
import { ASTPath } from 'jscodeshift';
import { ParsedSource } from './parsed-source';

const identifiesVariableDeclaration = (identifier: ASTPath<Identifier>): false | ASTPath<VariableDeclaration> => {
  const variableDeclarator = identifier.parent;
  if (variableDeclarator?.node?.type !== 'VariableDeclarator') {
    return false;
  }
  const variableDeclaration = variableDeclarator.parent;
  const match = variableDeclaration?.node?.type === 'VariableDeclaration';
  if (match) {
    return variableDeclaration;
  }
  return false;
};

const identifiesAnExport = (identifier: ASTPath<Identifier>): false | ExportNamedDeclaration => {
  const variableDeclaration = identifiesVariableDeclaration(identifier);
  if (!variableDeclaration) {
    return false;
  }
  const exportNamedDeclaration = variableDeclaration.parent;
  const match = exportNamedDeclaration?.node?.type === 'ExportNamedDeclaration';
  if (match) {
    return exportNamedDeclaration;
  }
  return false;
};

export const namedExportHasLocalUsage = (exportName: string, parsedSource: ParsedSource) => {
  const referencesToASymbolNamedOne = parsedSource.ast.find(parsedSource.j.Identifier, { name: exportName });
  return referencesToASymbolNamedOne
    .filter(path => !identifiesVariableDeclaration(path))
    .some(path => {
      const name = path.value.name;
      const scope = path.scope.lookup(name);
      const bindings = scope.getBindings()[name];
      return bindings.some((binding: any) => {
        const banana = identifiesAnExport(binding);
        return !!banana;
      });
    });
};