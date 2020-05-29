import { resolve } from "path";
import { probeForDeadCodeIn } from './dead-code';

test('identify the unused modules in the default exports sample ', () => {
  const result = probeForDeadCodeIn(resolve(__dirname, '../../sample/default-exports/'));
  expect(result).toHaveLength(1);
  expect(result[0].path).toContain('sample/default-exports/consumer.ts')
});