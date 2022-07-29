import { dirname, extname, resolve } from 'path'
import { Filesystem } from './filesystem'

export const fileExtensionFrom = (path: string) => extname(path).slice(1)

export type Importer = { path: string; importString: string }

/*
 if resolving imports becomes tedious have a look at https://github.com/dividab/tsconfig-paths
 */
export const pathToImportedSourceFile = (importer: Importer, filesystem: Filesystem) => {
  const currentFileDirectory = dirname(resolve(importer.path))
  const absoluteImportTarget = resolve(currentFileDirectory, importer.importString)
  const pathToImportedFile = absoluteImportTarget + '.ts'
  const pathToImportedIndexFile = resolve(absoluteImportTarget, 'index.ts')
  const candidates = [pathToImportedFile, pathToImportedIndexFile]
  const foundFile = candidates.find((p) => filesystem.exists(p))

  if (foundFile === undefined) {
    throw new Error(`:( ${candidates}`)
  }
  return foundFile
}