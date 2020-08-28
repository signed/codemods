import { apiForTypescript } from '../shared/utils';

test('rename variables ', () => {
  const api = apiForTypescript();
  const source = `
export const one = 'one global'
{
  const one = 'one in brackets'
}

function anotherFunction(){
  console.log(one)
}

function someFunction(){
  const one = 45
  console.log(one)
}`;

  const j = api.j;
  const ast = j(source);

  const actual = ast.findVariableDeclarators('one').renameTo('two');
  expect(actual).not.toContain('one');
});
