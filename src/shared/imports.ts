import { ImportDeclaration } from 'jscodeshift/src/core'
import { extractReferencedFileStringFrom } from './file-references'

export const extractImportString = (importDeclaration: ImportDeclaration): string => {
  return extractReferencedFileStringFrom(importDeclaration.source)
}
