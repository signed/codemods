import * as K from 'ast-types/gen/kinds'
import { isLiteral, isStringLiteral } from './typeguards'

export const extractReferencedFileStringFrom = (source: K.LiteralKind) => {
  if (isStringLiteral(source)) {
    return source.value
  }
  if (isLiteral(source) && typeof source.value === 'string') {
    return source.value
  }
  throw new Error(`Unable to extract import string from import declaration of source type ${source.type}`)
}
