import { InMemoryFilesystem } from '../shared/filesystem';
import { apiForTypescript } from '../shared/utils';
import { defaultExportNameResolver, Importer } from './default-to-named';

describe('defaultExportNameResolver', () => {
  test('should ', () => {
    const importer: Importer = { importString: '', path: '' };
    expect(() => defaultExportNameResolver(importer, apiForTypescript())).toThrow();
  });

  test('resolve import path and extract named export after transformation', () => {
    const filesystem = new InMemoryFilesystem();
    const importer: Importer = { path: '/tmp/importer.ts', importString: './example' };
    filesystem.files.set('/tmp/example.ts', `export default 'constant'`);
    expect(defaultExportNameResolver(importer, apiForTypescript(), filesystem)).toBe('Example')
  });

  test('resolve index.ts imports', () => {
    const filesystem = new InMemoryFilesystem();
    const importer: Importer = { path: '/tmp/importer.ts', importString: './example' };
    filesystem.files.set('/tmp/example/index.ts', `export default 'constant'`);
    expect(defaultExportNameResolver(importer, apiForTypescript(), filesystem)).toBe('Example')
  });
});
