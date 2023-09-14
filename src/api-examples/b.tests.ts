import { expect, test } from 'vitest'
import { parse } from './helpers'

test('rename variables', () => {
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
}`
  const parsed = parse(source)
  const ast = parsed.ast
  expect(ast.find(parsed.j.Identifier, { name: 'one' })).toHaveLength(5)
  const actual = ast.findVariableDeclarators('one').renameTo('two')
  expect(actual.find(parsed.j.Identifier, { name: 'one' })).toHaveLength(0)
})
