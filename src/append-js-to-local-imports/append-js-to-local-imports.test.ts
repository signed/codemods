import 'jest-extended'
import { InMemoryFilesystem } from '../shared/filesystem'
import { Importer } from '../shared/paths'
import { apiForTypescript } from '../shared/utils'
import { defaultIsDirectoryImport, transform } from './append-js-to-local-imports'

describe('append js to all local imports', () => {
  let isDirectoryReference = false
  const appendJsToLocalImports = (input: string) => {
    const noOptions = {}
    const fileInfo = { source: input.trim(), path: 'source-file.ts' }
    return transform(fileInfo, apiForTypescript(), noOptions, ()=> isDirectoryReference)
  }

  beforeEach(() => {
    isDirectoryReference = false
  })

  test('leave library imports alone', () => {
    const input = `
import { one } from '@example/package'
`
    const expected = `import { one } from '@example/package'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append .js to relative file imports', () => {
    const input = `
import { one } from './module'
`
    const expected = `import { one } from './module.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('leave relative import alone that already end with .js', () => {
    const input = `
import { one } from './module'
`
    const expected = `import { one } from './module.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append index.js to relative directory imports', () => {
    isDirectoryReference = true
    const input = `
import { one } from './directory'
`
    const expected = `import { one } from './directory/index.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append .js to local re-exports', () => {
    const input = `
export { one } from './module' 
`
    const expected = `export { one } from './module.js'`
    expect(appendJsToLocalImports(input)).toEqual(expected)
  })

  test('append index.js to local re-exports from a directory', () => {
    isDirectoryReference = true
    const input = `
export { one } from './directory' 
`
    const expected = `export { one } from './directory/index.js'`
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