import { DoNotTransform } from './jscodeshift-constants';
import { transform } from './default-to-named-export';
import { apiForTypescript } from '../utils';
import 'jest-extended';

describe('replace default export with named export', () => {
  let path = '';
  const transformedDefaultExport = (input: string) => {
    const noOptions = {};
    const fileInfo = { source: input, path };
    return transform(fileInfo, apiForTypescript(), noOptions);
  };

  beforeEach(() => {
    path = 'export-name.ts';
  });

  test('preserve line comment at the start of the file', () => {
    const input = `// preserve this comment
export default 'banana';`;
    expect(transformedDefaultExport(input)).toStartWith('// preserve this comment');
  });
  test('do not change type definition files', () => {
    path = 'sample.d.ts';
    expect(transformedDefaultExport(`export default 'banana';`)).toEqual(DoNotTransform);
  });

  test('derive export name from file name', () => {
    path = 'strip/this/out/this-is-the-file.ts';
    expect(transformedDefaultExport(`export default 'banana';`)).toStartWith('export const ThisIsTheFile =')
  });

  describe('expressions', () => {
    test('string literal default export', () => {
      expect(transformedDefaultExport(`export default 'banana';`)).toEqual(`export const ExportName = 'banana';`);
    });
    test('numeric literal default export', () => {
      expect(transformedDefaultExport(`export default 42;`)).toEqual(`export const ExportName = 42;`);
    });
    test('function expressions default export', () => {
      const input = `const call = () => 44;
export default call();`;
      const expected = `const call = () => 44;
export const ExportName = call();`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
    test('arrow function expression default export', () => {
      const input = `export default () => {};`;
      const expected = `export const exportName = () => {};`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
  });

  describe('declarations', () => {
    test('anonymous function declaration default export', () => {
      const input = `export default function() {}`;
      const expected = `export function exportName() {}`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
    test('function declaration default export', () => {
      const input = `export default function theName() {}`;
      const expected = `export function theName() {}`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
    test('interface declaration default export', () => {
      const input = `export default interface TheInterface {}`;
      const expected = `export interface TheInterface {}`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
    test('anonymous class declaration default export', () => {
      const input = `export default class {}`;
      const expected = `export class ExportName {}`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
    test('class declaration default export', () => {
      const input = `export default class TheClass {}`;
      const expected = `export class TheClass {}`;
      expect(transformedDefaultExport(input)).toEqual(expected);
    });
  });
});
