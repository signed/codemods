import { Program } from './gilded-rose';

describe('safety net', () => {
  test('can cope with no items ', () => {
    const program = new Program([]);
    expect(program.updateAndReturnRemainingItems()).toHaveLength(0);
  });
});
