import { apiForTypescript } from '../utils';
import transform from './default-to-named-export';

const input = `// default-export-string-literal.ts
export default 'banana';

export const constantString = () => 'cucumber';
`;

const expected = `
// default-export-string-literal.ts
export const One = 'banana';

export const constantString = () => 'cucumber';
`;

describe('replace default export with named export', () => {
  test('String Literal default export ', () => {
    const transformOptions = {};
    const fileInfo = { source: input.trim(), path: 'stand-in' };
    const actual = transform(fileInfo, apiForTypescript(), transformOptions);
    expect(actual).toEqual(expected.trim());
  });
});
