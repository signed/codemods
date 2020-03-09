import { apiForTypescript } from '../utils';
import transform from './default-to-named-export';
import 'jest-extended';

describe('replace default export with named export', () => {
  const transformedDefaultExport = (input: string) => {
    const noOptions = {};
    const fileInfo = { source: input.trim(), path: 'export-name.ts' };
    return transform(fileInfo, apiForTypescript(), noOptions);
  };
  test('preserve line comment at the start of the file', () => {
    const input = `// preserve this comment
export default 'banana';`;
    expect(transformedDefaultExport(input)).toStartWith('// preserve this comment');
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
  });

  test('interface declaration default export', () => {
    const input = `export default interface Banana {}`;
    const expected = `export interface Banana {}`;
    expect(transformedDefaultExport(input)).toEqual(expected);
  });
});
