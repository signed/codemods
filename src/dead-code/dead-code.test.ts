import { resolve } from 'path';
import { apiForTypescript } from '../shared/utils';
import { extractImportStringsFrom, probeForDeadCodeIn } from './dead-code';

test('identify the unused modules in the default exports sample ', () => {
  const result = probeForDeadCodeIn(resolve(__dirname, '../../sample/default-exports/'));
  expect(result).toHaveLength(1);
  expect(result[0].path).toContain('sample/default-exports/consumer.ts');
});

const importInt = (source: string) => {
  const imports = extractImportStringsFrom(source, apiForTypescript().j);
  expect(imports).toHaveLength(1);
  return imports[0];
};

describe('extractImportStringsFrom', () => {
  test('identify default imports', () => {
    expect(importInt(`import anything from './sample'`))
      .toStrictEqual({ importString: './sample', imports: ['default'] });
  });
  test('identify export all declarations', () => {
    expect(importInt(`export * from './sample'`))
      .toStrictEqual({ importString: './sample', imports: 'all' });
  });
});
