import { resolve } from 'path'
import { expect, test } from 'vitest'
import { Project } from './project'

test('migrate import in project', async () => {
  const projectRoot = resolve(__dirname, `../../sample/migrate-import/`)
  const transformerPath = resolve(__dirname, `../migrate-import/migrate-import.ts`)

  const options = {
    toReplace: 'prettier',
    replacement: 'beautiful',
  }

  const result = await new Project(projectRoot).run({ transformerPath, options, dry: true })
  if (result === undefined) {
    throw new Error('expecting a result object')
  }
  expect(result.ok).toEqual(1)
})
