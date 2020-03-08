import { apiForTypescript } from '../utils';
import transform from './default-to-named-export';

describe('replace default export with named export', () => {
  const transformedDefaultExport = (input: string) => {
    const noOptions = {};
    const fileInfo = { source: input.trim(), path: 'export-name.ts' };
    return transform(fileInfo, apiForTypescript(), noOptions);
  };

  test('preserve comments at the start of the file', () => {
    const input = `// default-export-string-literal.ts
export default 'banana';

export const constantString = () => 'cucumber';`;
    const expected = `// default-export-string-literal.ts
export const ExportName = 'banana';

export const constantString = () => 'cucumber';`;
    expect(transformedDefaultExport(input)).toEqual(expected);
  });

  test('string Literal default export ', () => {
    expect(transformedDefaultExport(`export default 'banana';`)).toEqual(`export const ExportName = 'banana';`.trim());
  });
});
