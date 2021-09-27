import {
  ASTPath, ExportNamedDeclaration,
  Identifier,
  VariableDeclaration,
  ClassDeclaration,
  TSInterfaceDeclaration,
} from 'jscodeshift'
import { ParsedSource } from './parsed-source'

const identifiesVariableDeclaration = (identifier: ASTPath<Identifier>): false | ASTPath<VariableDeclaration> => {
  const variableDeclarator = identifier.parent
  if (variableDeclarator?.node?.type !== 'VariableDeclarator') {
    return false
  }
  const variableDeclaration = variableDeclarator.parent
  const match = variableDeclaration?.node?.type === 'VariableDeclaration'
  if (match) {
    return variableDeclaration
  }
  return false
}

const identifiesAnExport = (identifier: ASTPath<Identifier>): false | ExportNamedDeclaration => {
  let current = identifier.parent
  do {
    const match = current?.node?.type === 'ExportNamedDeclaration'
    if (match) {
      return current
    }
    current = current.parent
  } while (current)
  return false
}

const identifiesAnClassDeclaration = (identifier: ASTPath<Identifier>): false | ClassDeclaration => {
  const classDeclaration = identifier.parent
  const match = classDeclaration?.node?.type === 'ClassDeclaration'
  if (match) {
    return classDeclaration
  }
  return false
}

const identifiesTSInterfaceDeclaration = (identifier: ASTPath<Identifier>): false | TSInterfaceDeclaration => {
  const tsInterfaceDeclaration = identifier.parent
  const match = tsInterfaceDeclaration?.node?.type === 'TSInterfaceDeclaration'
  if (match) {
    return tsInterfaceDeclaration
  }
  return false
}

export const namedExportHasLocalUsage = (exportName: string, parsedSource: ParsedSource) => {
  const identifiersReferencingExportName = parsedSource.ast.find(parsedSource.j.Identifier, { name: exportName })
  return identifiersReferencingExportName
    .filter((path) => !identifiesVariableDeclaration(path))
    .filter((path) => !identifiesAnClassDeclaration(path))
    .filter((path) => !identifiesTSInterfaceDeclaration(path))
    .some((path) => {
      const name = path.value.name
      const scope = path.scope.lookup(name)
      if (scope === null) {
        // there is no scope there can be no shadowed variables
        // todo pass in the list of know exports to check against
        return true
      }
      const bindings = scope.getBindings()[name]
      return bindings.some((binding: any) => {
        return !!identifiesAnExport(binding)
      })
    })
}
