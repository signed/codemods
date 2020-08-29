import { existsSync, readFileSync } from 'fs'

export interface Filesystem {
  exists(path: string): boolean

  readFileAsString(pathToImportedFile: string): string
}

export class DefaultFilesystem implements Filesystem {
  exists(path: string): boolean {
    return existsSync(path)
  }

  readFileAsString(pathToImportedFile: string): string {
    return readFileSync(pathToImportedFile, { encoding: 'utf8' })
  }
}

export class InMemoryFilesystem implements Filesystem {
  readonly files = new Map<string, string>()

  exists(path: string): boolean {
    return this.files.has(path)
  }

  readFileAsString(path: string): string {
    const maybeFile = this.files.get(path)
    if (maybeFile === undefined) {
      throw new Error(`file not found ${path}`)
    }
    return maybeFile
  }
}
