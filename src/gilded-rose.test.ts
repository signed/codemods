import { Item, Program } from './gilded-rose';

describe('safety net', () => {
  test('can cope with no items', () => {
    const program = new Program([]);
    expect(program.updateAndReturnRemainingItems()).toHaveLength(0);
  });

  test('expired items stay in the shop ', () => {
    const commonItem = new Item('any common item', 0, 0);
    const program = new Program([commonItem]);

    const items = program.updateAndReturnRemainingItems();
    expect(items).toHaveLength(1);
    expect(items[0].SellIn).toBe(-1);
    expect(items[0].Quality).toBe(0);
  });

  describe('common items', () => {
    test('decrease quality by one each day as long as sell in is not reached', () => {
      const commonItem = new Item('any common item', 1, 10);
      const program = new Program([commonItem]);

      const items = program.updateAndReturnRemainingItems();
      expect(items[0].SellIn).toBe(0);
      expect(items[0].Quality).toBe(9);
    });
    test('decrease quality by two after sell in was reached', () => {
      const commonItem = new Item('any common item', 0, 10);
      const program = new Program([commonItem]);

      const items = program.updateAndReturnRemainingItems();
      expect(items[0].SellIn).toBe(-1);
      expect(items[0].Quality).toBe(8);
    });
    test('quality is never decreased below 0', () => {
      const commonItem = new Item('any common item', 1, 0);
      const program = new Program([commonItem]);

      expect((program.updateAndReturnRemainingItems())[0].Quality).toBe(0);
      expect((program.updateAndReturnRemainingItems())[0].Quality).toBe(0);
    });
  });
});
