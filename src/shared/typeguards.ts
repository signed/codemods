import * as K from 'ast-types/gen/kinds'
import * as N from 'ast-types/gen/nodes'

export const isStringLiteral = (toCheck: K.LiteralKind): toCheck is K.StringLiteralKind => {
  return toCheck.type === 'StringLiteral'
}

export const isLiteral = (toCheck: K.LiteralKind): toCheck is N.Literal => {
  return toCheck.type === 'Literal'
}
