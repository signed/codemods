export const usedInThisFile = () => '42'
export const usedConstant = '124'

export interface InterfaceReferencedInAnotherInterfaceDeclaration {}

export interface InterfaceUsedInTypeParameter {
  usage: InterfaceReferencedInAnotherInterfaceDeclaration
}

export interface InterfaceUsedInVariableDeclaration {}

export class UsedClass<T> {}

export const unused = () => {
  let jump: InterfaceUsedInVariableDeclaration
  new UsedClass<InterfaceUsedInTypeParameter>()
  return usedInThisFile() + usedConstant
}
