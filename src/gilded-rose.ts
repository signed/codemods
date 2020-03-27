/**
 * Hi and welcome to team Gilded Rose.
 * As you know, we are a small inn with a prime location in a prominent city ran by a friendly innkeeper named Allison.
 * We also buy and sell only the finest goods. Unfortunately, our goods are constantly degrading in quality as they approach their sell by date.
 * We have a system in place that updates our inventory for us.
 * It was developed by a no-nonsense type named Leeroy, who has moved on to new adventures.
 * Your task is to add the new feature to our system so that we can begin selling a new category of items.
 * First an introduction to our system:
 *
 * All items have a SellIn value which denotes the number of days we have to sell the item
 * All items have a Quality value which denotes how valuable the item is
 * At the end of each day our system lowers both values for every item
 *
 * Pretty simple, right? Well this is where it gets interesting:
 *
 * Once the sell by date has passed, Quality degrades twice as fast
 * The Quality of an item is never negative
 * “Aged Brie” actually increases in Quality the older it gets
 * The Quality of an item is never more than 50
 * “Sulfuras”, being a legendary item, never has to be sold or decreases in Quality
 * “Backstage passes”, like aged brie, increases in Quality as it’s SellIn value approaches; Quality increases by 2 when there are 10 days or less and by 3 when there are 5 days or less but Quality drops to 0 after the concert
 *
 * We have recently signed a supplier of conjured items. This requires an update to our system:
 * “Conjured” items degrade in Quality twice as fast as normal items
 *
 * Feel free to make any changes to the UpdateQuality method and add any new code as long as everything still works correctly.
 * However, do not alter the Item class or Items property as those belong to the goblin in the corner who will insta-rage and one-shot you as he doesn’t believe in shared code ownership (you can make the UpdateQuality method and Items property static if you like, we’ll cover for you).
 */
export class Item {
  constructor(public Name: string, public SellIn: number, public  Quality: number) {
  }
}

export const MaximumItemQuality = 50;

const AgedBrie = 'Aged Brie';
const BackstagePasses = 'Backstage passes to a TAFKAL80ETC concert';
const SulfurasHand = 'Sulfuras, Hand of Ragnaros';

interface ItemUpdater {
  update(item: Item): void;
}

class SulfurasUpdater implements ItemUpdater{
  public update(item: Item) {
    // do nothing
  }
}

export class Program {
  constructor(private Items: Array<Item>) {
  }

  public updateAndReturnRemainingItems (){
    this.UpdateQuality();
    return this.Items;
  }

  public UpdateQuality(): void {
    this.Items.forEach(Program.update);
  }

  private static update(item: Item) {
    const isBackstagePasses = item.Name == BackstagePasses;
    const isAgedBrie = item.Name == AgedBrie;
    if(item.Name == SulfurasHand){
      new SulfurasUpdater().update(item);
      return;
    }

    if (!isAgedBrie && !isBackstagePasses) {
      if (item.Quality > 0) {
        item.Quality = item.Quality - 1;
      }
    } else {
      if (item.Quality < MaximumItemQuality) {
        item.Quality = item.Quality + 1;

        if (isBackstagePasses) {
          if (item.SellIn < 11) {
            if (item.Quality < MaximumItemQuality) {
              item.Quality = item.Quality + 1;
            }
          }

          if (item.SellIn < 6) {
            if (item.Quality < MaximumItemQuality) {
              item.Quality = item.Quality + 1;
            }
          }
        }
      }
    }

    if (item.SellIn <= 0) {
      if (!isAgedBrie) {
        if (!isBackstagePasses) {
          if (item.Quality > 0) {
            item.Quality = item.Quality - 1;
          }
        } else {
          item.Quality = item.Quality - item.Quality;
        }
      } else {
        if (item.Quality < MaximumItemQuality) {
          item.Quality = item.Quality + 1;
        }
      }
    }
    item.SellIn = item.SellIn - 1;
  }
}

export class SpecialItems {
  static agedBrie = () => new Item(AgedBrie, 2, 0);
  static backstagePasses = () => new Item(BackstagePasses, 15, 20);
  static sulfurasHand = () => new Item(SulfurasHand, 0, 80);
}

console.log('OMGHAI!');

const Items: Array<Item> = [
  new Item('+5 Dexterity Vest', 10, 20),
  SpecialItems.agedBrie(),
  new Item('Elixir of the Mongoose', 5, 7),
  (SpecialItems.sulfurasHand()),
  (SpecialItems.backstagePasses()),
  new Item('Conjured Mana Cake', 3, 6)
];

var app = new Program(Items);
app.UpdateQuality();


