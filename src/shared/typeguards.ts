import * as K from 'ast-types/gen/kinds'
import { Literal } from 'jscodeshift'

export const isStringLiteral = (toCheck: K.LiteralKind): toCheck is K.StringLiteralKind => {
  return toCheck.type === 'StringLiteral'
}

export const isLiteral = (toCheck: K.LiteralKind): toCheck is Literal => {
  return toCheck.type === 'Literal'
}
