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
  test('string literal default export ', () => {
    expect(transformedDefaultExport(`export default 'banana';`)).toEqual(`export const ExportName = 'banana';`);
  });
  test('numeric literal default export ', () => {
    expect(transformedDefaultExport(`export default 42;`)).toEqual(`export const ExportName = 42;`);
  });
});
