import 'jest-extended'
import { apiForTypescript } from '../shared/utils'
import { transform } from './migrate-import'

describe('replace import source', () => {
  const replaceImport = (input: string, toReplace: string, replacement: string) => {
    const noOptions = {
      toReplace,
      replacement,
    }
    const fileInfo = { source: input, path: 'source-file.ts' }
    return transform(fileInfo, apiForTypescript(), noOptions)
  }

  test('exact match', () => {
    const input = `import { sample } from '@example/package-old'`
    const expected = `import { sample } from '@example/package-new'`
    expect(replaceImport(input, '@example/package-old', '@example/package-new')).toEqual(expected)
  })

  test('prefix match preserves not matching suffix', () => {
    const input = `import { sample } from '@example/package-old/deep'`
    const expected = `import { sample } from '@example/package-new/deep'`
    expect(replaceImport(input, '@example/package-old', '@example/package-new')).toEqual(expected)
  })
})
