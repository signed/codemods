import { defaultExportNameResolver, Importer } from './default-to-named';

describe('defaultExportNameResolver', () => {
  test('should ', () => {
    const importer: Importer = { importString: '', path: '' };
    expect(defaultExportNameResolver(importer)).toEqual('StandInExportName');
  });
});