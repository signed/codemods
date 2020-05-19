import { existsSync, readFileSync } from 'fs';

export interface Filesystem {
  exists(path: string): boolean;

  readFileAsString(pathToImportedFile: string): string;
}

export class DefaultFilesystem implements Filesystem {
  exists(path: string): boolean {
    return existsSync(path);
  }

  readFileAsString(pathToImportedFile: string): string {
    return readFileSync(pathToImportedFile, { encoding: 'utf8' });
  }
}