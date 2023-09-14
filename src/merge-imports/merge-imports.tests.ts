import { describe, test, expect } from 'vitest'
import { apiForTypescript } from '../shared/utils'
import { transform } from './merge-imports'

describe('merge multiple imports from the same module into one', () => {
  const mergeImports = (input: string) => {
    const noOptions = {}
    const fileInfo = { source: input.trim(), path: 'source-file.ts' }
    return transform(fileInfo, apiForTypescript(), noOptions)
  }

  test('leave single imports alone', () => {
    const input = `
import { one } from '@example/package'
`
    const expected = `import { one } from '@example/package'`
    expect(mergeImports(input)).toEqual(expected)
  })

  test('two value imports from the same package', () => {
    const input = `
import { one } from '@example/package'
import { two } from '@example/package'
import { three } from '@example/package'
`
    const expected = `import { one, two, three } from '@example/package';`
    expect(mergeImports(input)).toEqual(expected)
  })

  test('do not merge value and type imports for now (typescript 4.5 can do this)', () => {
    const input = `
import type { one } from '@example/package'
import { two } from '@example/package'
`
    const expected = `
import type { one } from '@example/package'
import { two } from '@example/package'
`.trim()
    expect(mergeImports(input)).toEqual(expected)
  })

  test('ignore star imports to keep tree shaking working', () => {
    const input = `
import * as Package from '@example/package'
import { two } from '@example/package'
`
    const expected = `
import * as Package from '@example/package'
import { two } from '@example/package'
`.trim()
    expect(mergeImports(input)).toEqual(expected)
  })
})
