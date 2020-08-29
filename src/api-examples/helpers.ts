import { DefaultParsedSource } from '../shared/parsed-source'
import { apiForTypescript } from '../shared/utils'

export const parse = (source: string) => {
  return new DefaultParsedSource(source, apiForTypescript().j)
}