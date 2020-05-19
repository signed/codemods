import { Filesystem } from './filesystem';
import { apiForTypescript } from '../utils';
import { defaultExportNameResolver, Importer } from './default-to-named';

class InMemoryFilesystem implements Filesystem {
  readonly files = new Map<string, string>();

  exists(path: string): boolean {
    return this.files.has(path);
  }

  readFileAsString(path: string): string {
    const maybeFile = this.files.get(path);
    if (maybeFile === undefined) {
      throw new Error(`file not found ${path}`);
    }
    return maybeFile;
  }
}

describe('defaultExportNameResolver', () => {
  test('should ', () => {
    const importer: Importer = { importString: '', path: '' };
    expect(() => defaultExportNameResolver(importer, apiForTypescript())).toThrow();
  });

  test('broken test that needs to control the current working directory in production code', () => {
    const filesystem = new InMemoryFilesystem();
    const importer: Importer = { importString: './example', path: '/tmp/' };
    filesystem.files.set('/example.ts', `export default 'constant'`);
    expect(defaultExportNameResolver(importer, apiForTypescript(), filesystem)).toBe('Example')
  });
});