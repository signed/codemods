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
});
