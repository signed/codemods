import 'jest-extended'
import { InMemoryFilesystem } from '../shared/filesystem'
import { Importer } from '../shared/paths'
import { apiForTypescript } from '../shared/utils'
import { defaultIsDirectoryImport, transform } from './append-js-to-local-imports'

describe('append js to all local imports', () => {
  let isIndexTsImport = false
  const appendJsToLocalImports = (input: string) => {
    const noOptions = {}
    const fileInfo = { source: input.trim(), path: 'source-file.ts' }
    return transform(fileInfo, apiForTypescript(), noOptions, ()=> isIndexTsImport)
  }

  test('leave library imports alone', () => {
    const input = `
import { one } from '@example/package'
`
    const expected = `import { one } from '@example/package'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append .js to relative file imports', () => {
    const input = `
import { one } from './example'
`
    const expected = `import { one } from './example.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('leave relative import alone that already end with .js', () => {
    const input = `
import { one } from './example'
`
    const expected = `import { one } from './example.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append index.js to relative directory imports', () => {
    isIndexTsImport = true
    const input = `
import { one } from './module'
`
    const expected = `import { one } from './module/index.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })
})

test('detect that direct index file import is not a directory import', () => {
  const filesystem = new InMemoryFilesystem()
  const importer: Importer = {
    path: '/tmp/importer.ts',
    importString: './index',
  }
  filesystem.files.set('/tmp/index.ts', `export {}`)
  expect(defaultIsDirectoryImport(importer, filesystem)).toBe(false)
})