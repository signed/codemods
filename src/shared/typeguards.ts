import * as K from 'ast-types/lib/gen/kinds'
import { namedTypes } from 'ast-types'
import { Literal } from 'jscodeshift'

export const isStringLiteral = (toCheck: K.LiteralKind): toCheck is K.StringLiteralKind => {
  return toCheck.type === 'StringLiteral'
}

export const isLiteral = (toCheck: K.LiteralKind): toCheck is Literal => {
  return toCheck.type === 'Literal'
}

export const isTSTypeParameter = (toCheck: K.IdentifierKind): toCheck is namedTypes.TSTypeParameter => {
  return toCheck.type === 'TSTypeParameter'
}
