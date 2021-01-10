import { ImportDeclaration } from 'jscodeshift/src/core'
import { isLiteral, isStringLiteral } from './typeguards'

export const extractImportString = (importDeclaration: ImportDeclaration): string => {
  let source = importDeclaration.source
  if (isStringLiteral(source)) {
    return source.value
  }
  if (isLiteral(source) && typeof source.value === 'string') {
    return source.value
  }
  throw new Error(`Unable to extract import string from import declaration of source type ${source.type}`)
}
