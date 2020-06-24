import { resolve } from 'path';
import { apiForTypescript } from '../shared/utils';
import { extractImportsFrom, Import, probeForDeadCodeIn } from './dead-code';

test('identify the unused modules in the default exports sample ', () => {
  const result = probeForDeadCodeIn(resolve(__dirname, '../../sample/default-exports/'));
  expect(result).toHaveLength(1);
  expect(result[0].path).toContain('sample/default-exports/consumer.ts');
});

const importIn = (source: string) => {
  const imports = extractImportsFrom(source, apiForTypescript().j);
  expect(imports).toHaveLength(1);
  return imports[0];
};

describe('extractImportStringsFrom', () => {
  test('identify default imports', () => {
    expect(importIn(`import anything from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['default'] });
  });
  test('identify export all declarations', () => {
    expect(importIn(`export * from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: 'all' });
  });
  test.skip('identify named import', () => {
    expect(importIn(`export {one} from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['one'] });
  });
});
