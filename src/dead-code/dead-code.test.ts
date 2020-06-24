import { resolve } from 'path';
import { apiForTypescript } from '../shared/utils';
import { extractImportStringsFrom, probeForDeadCodeIn } from './dead-code';

test('identify the unused modules in the default exports sample ', () => {
  const result = probeForDeadCodeIn(resolve(__dirname, '../../sample/default-exports/'));
  expect(result).toHaveLength(1);
  expect(result[0].path).toContain('sample/default-exports/consumer.ts');
});

describe('extractImportStringsFrom', () => {
  test('identify default imports ', () => {
    const strings = extractImportStringsFrom(`import flup from './sample'`, apiForTypescript().j);
    expect(strings).toStrictEqual(['./sample']);
  });
});