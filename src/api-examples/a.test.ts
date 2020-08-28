import { namedExportHasLocalUsage } from '../shared/import-export';
import { DefaultParsedSource, ParsedSource } from '../shared/parsed-source';
import { apiForTypescript } from '../shared/utils';

test('detect if a named export has local usage ', () => {
  const api = apiForTypescript();
  const source = `
export const one = 'one global'
export const two = 'two global'
{
  const one = 'one in brackets'
}

function anotherFunction(){
  const two = 'jump'
  console.log(two)
  console.log(one)
}

function someFunction(){
  const one = 45
  console.log(one)
}`;

  const parsedSource: ParsedSource = new DefaultParsedSource(source, api.j);
  expect(namedExportHasLocalUsage('one', parsedSource)).toBeTrue();
  expect(namedExportHasLocalUsage('two', parsedSource)).toBeFalse();
});
