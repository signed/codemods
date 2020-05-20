import 'jest-extended';
import { apiForTypescript } from '../utils';
import { transform } from './default-to-named-import';

describe('replace default import with named import', () => {
  let exportName: string;

  const transformDefaultImports = (input: string) => {
    const noOptions = {};
    const fileInfo = { source: input, path: 'stand-in.ts' };
    return transform(fileInfo, apiForTypescript(), noOptions, () => exportName);
  };

  beforeEach(() => {
    exportName = 'DeclaresDefaultExport';
  });

  test('convert to named import', () => {
    const input = `import DeclaresDefaultExport from './declares-default-export'`;
    const expected = `import { DeclaresDefaultExport } from './declares-default-export';`;
    expect(transformDefaultImports(input)).toEqual(expected);
  });

  test('use an alias if the local name does not match the export name', () => {
    exportName = 'doesNotMatch';
    const input = `import LocalName from './declares-default-export'`;
    const expected = `import { doesNotMatch as LocalName } from './declares-default-export';`;
    expect(transformDefaultImports(input)).toEqual(expected);
  });

  test('transform renamed default imports', () => {
    const input = `import { default as LocalName } from './declares-default-export'`;
    const expected = `import { DeclaresDefaultExport as LocalName } from './declares-default-export'`;
    expect(transformDefaultImports(input)).toEqual(expected);
  });

  test('remove alias for renamed default import if it matches the new export name', () => {
    exportName = 'LocalName'
    const input = `import { default as LocalName } from './declares-default-export'`;
    const expected = `import { LocalName } from './declares-default-export'`;
    expect(transformDefaultImports(input)).toEqual(expected);
  });
});
