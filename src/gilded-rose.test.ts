import { Item, Program, SpecialItems } from './gilded-rose';

const agedBrie = (override: Partial<Omit<Item, 'Name'>>): Item => {
  const item = SpecialItems.agedBrie();
  const sellIn = override.SellIn ?? item.SellIn;
  const quality = override.Quality ?? item.Quality;
  return new Item(item.Name, sellIn, quality)
};

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

  describe('aged brie', () => {
    test('increases quality over time', () => {
      const program = new Program([agedBrie({ Quality: 1 })]);
      const items = program.updateAndReturnRemainingItems();
      expect(items[0].Quality).toBe(2);
    });
    test('increases quality bv two after sell in was reached ', () => {
      const program = new Program([agedBrie({ SellIn: 0, Quality: 0 })]);
      const items = program.updateAndReturnRemainingItems();
      expect(items[0].Quality).toBe(2);
    });
    test('tops out at quality of 50', () => {
      const program = new Program([agedBrie({ Quality: 50 })]);
      const items = program.updateAndReturnRemainingItems();
      expect(items[0].Quality).toBe(50);
    });

  });

  describe('backstage passes', () => {
    test('increase in quality by one if the concert is more than 10 days away', () => {
      const item = SpecialItems.backstagePasses();
      const program = new Program([new Item(item.Name, 11, 0)]);

      const items = program.updateAndReturnRemainingItems();
      expect(items[0].Quality).toBe(1);
    });
    test('increase in quality by two if the concert is 10 or less days away', () => {
      const item = SpecialItems.backstagePasses();
      expect((new Program([new Item(item.Name, 10, 0)]).updateAndReturnRemainingItems())[0].Quality).toBe(2);
      expect((new Program([new Item(item.Name, 6, 0)]).updateAndReturnRemainingItems())[0].Quality).toBe(2);
    });
    test('increase in quality by five if the concert is than 5 or less days away', () => {
      const item = SpecialItems.backstagePasses();
      expect((new Program([new Item(item.Name, 5, 0)]).updateAndReturnRemainingItems())[0].Quality).toBe(3);
      expect((new Program([new Item(item.Name, 1, 0)]).updateAndReturnRemainingItems())[0].Quality).toBe(3);
    });
    test('quality drops to zero after the concert', () => {
      const item = SpecialItems.backstagePasses();
      expect((new Program([new Item(item.Name, 0, 200)]).updateAndReturnRemainingItems())[0].Quality).toBe(0);
    });
  });

  describe('sulfuras hand', () => {
    test('never decreases in quality', () => {
      const item = SpecialItems.sulfurasHand();
      expect((new Program([new Item(item.Name, 5, 200)]).updateAndReturnRemainingItems())[0].SellIn).toBe(5);
      expect((new Program([new Item(item.Name, 5, 200)]).updateAndReturnRemainingItems())[0].Quality).toBe(200);
      expect((new Program([new Item(item.Name, -1, 200)]).updateAndReturnRemainingItems())[0].Quality).toBe(200);
      expect((new Program([new Item(item.Name, 0, 200)]).updateAndReturnRemainingItems())[0].Quality).toBe(200);
    });
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
