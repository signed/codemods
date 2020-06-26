import { resolve } from 'path';
import { DefaultFilesystem } from '../shared/filesystem';
import { apiForTypescript } from '../shared/utils';
import { Export, extractExportsFrom, extractImportsFrom, Import, probeForDeadCodeIn } from './dead-code';

const defaultExportsSamples = (file: string = '') => resolve(__dirname, `../../sample/default-exports/${file}`);

test('identify the unused modules in the default exports sample ', () => {
  const result = probeForDeadCodeIn(defaultExportsSamples());
  expect(result).toHaveLength(1);
  expect(result[0].path).toContain('sample/default-exports/consumer.ts');
});

const importIn = (source: string) => {
  const imports = extractImportsFrom(source, apiForTypescript().j);
  expect(imports).toHaveLength(1);
  return imports[0];
};

describe('extractImportFrom', () => {
  test('identify re export all exports', () => {
    expect(importIn(`export * from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: 'all-exports' });
  });
  test('identify re export specific exports', () => {
    expect(importIn(`export {one, two} from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['one', 'two'] });
  });

  test('identify default imports', () => {
    expect(importIn(`import anything from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['default'] });
  });
  test('identify named import', () => {
    expect(importIn(`import {one, two} from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['one', 'two'] });
  });
  test('identify mixed named and default import', () => {
    expect(importIn(`import one, {two} from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['two', 'default'] });
  });
  test('identify renamed named import', () => {
    expect(importIn(`import {one as two} from './sample'`))
      .toStrictEqual<Import>({ importString: './sample', imported: ['one'] });
  });
});

const exportsIn = (source: string) => extractExportsFrom(source, apiForTypescript().j);

const exportIn = (source: string) => {
  const exports = exportsIn(source);
  expect(exports).toHaveLength(1);
  return exports[0];
};

describe('extractExportsFrom', () => {
  test('identify default export', () => {
    expect(exportIn(`export default 42`))
      .toStrictEqual<Export>({ exportString: 'default' });
  });

  test.each([
    'default-export-class.ts',
    'default-export-function.ts',
    'default-export-object-literal.ts',
    'default-export-string-literal.ts'
  ])('detect default export in %s ', (filename) => {
    const source = new DefaultFilesystem().readFileAsString(defaultExportsSamples(filename));
    expect(exportsIn(source))
      .toContainEqual<Export>({ exportString: 'default' });
  });

  test('identify named exports', () => {
    expect(exportsIn(`export const one = 42
export const two = 2`))
      .toStrictEqual<Export[]>([{ exportString: 'one' }, { exportString: 'two' }]);
  });

  test('only extract the identifier of the export ', () => {
    expect(exportIn(`export const one = (notAnExport:string) => {}`))
      .toStrictEqual<Export>({ exportString: 'one' });
  });
  test('extract interface exports', () => {
    expect(exportIn(`export interface One {}`))
      .toStrictEqual<Export>({ exportString: 'One' });
  });
  test('extract class exports', () => {
    expect(exportIn(`export class One {}`))
      .toStrictEqual<Export>({ exportString: 'One' });
  });
  test('extract enum exports', () => {
    expect(exportIn(`export enum One { one, two}`))
      .toStrictEqual<Export>({ exportString: 'One' });
  });
  test('extract type exports', () => {
    expect(exportIn(`export type One = string`))
      .toStrictEqual<Export>({ exportString: 'One' });
  });
  test('extract re export', () => {
    expect(exportIn(`export { One } from '../sample'`))
      .toStrictEqual<Export>({ exportString: 'One' });
  });
  test('extract renamed re export', () => {
    expect(exportIn(`export { One as Two } from '../sample'`))
      .toStrictEqual<Export>({ exportString: 'Two' });
  });
});
