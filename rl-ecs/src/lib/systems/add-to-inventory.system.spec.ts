import { EntityManager, EntityId } from 'rad-ecs';
import { GridPos } from '../components/position.model';
import { Inventory } from '../components/inventory.model';
import {
  addToInventory,
  AddToInventoryArgs,
  AddToInventoryOut,
  hookAddToInventory
} from './add-to-inventory.system';
import { Subject } from 'rxjs';
import { Logger } from '../ecs.types';

describe('Add to inventory', () => {
  let em: EntityManager;
  let logger: Logger;
  let item: EntityId;
  let collector: EntityId;
  let msg: AddToInventoryArgs;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    logger = msg => console.log(`LOG: ${msg}`);
    item = em.createEntity().id;
    collector = em.createEntity(new Inventory({ contents: [] })).id;
    msg = { protagId: collector, targetId: item };
  });

  describe('Message process step', () => {
    it('should add the entity to the inventory of the target', () => {
      addToInventory(msg, em, logger);
      expect(em.getComponent(collector, Inventory)!.contents).toContain(item);
    });

    it('should do raise an error if the protagonist does NOT have an inventory component', () => {
      em.removeComponent(collector, Inventory);
      expect(() => addToInventory(msg, em, logger)).toThrow();
    });

    it('should remove the grid position from the entity added', () => {
      em.setComponent(item, new GridPos({ x: 0, y: 0, z: 0 }));
      addToInventory(msg, em, logger);
      expect(em.getComponent(item, GridPos)).toEqual(undefined);
    });
  });

  describe('Hook observables', () => {
    let input: Subject<AddToInventoryArgs>;
    let output: Subject<AddToInventoryArgs & AddToInventoryOut>;
    beforeEach(() => {
      input = new Subject<AddToInventoryArgs>();
      output = new Subject<AddToInventoryArgs & AddToInventoryOut>();
    });
    it('should swallow the event if the protagonist does NOT have an inventory', () => {
      hookAddToInventory(input, output, em, logger);
      em.removeComponent(collector, Inventory);
      let eventSeen = false;
      output.subscribe(() => (eventSeen = true));
      input.next({ protagId: collector, targetId: item });
      expect(eventSeen).toEqual(false);
    });

    it('should correctly produce the expected event on collection of the entity', () => {
      hookAddToInventory(input, output, em, logger);
      let outMsg = {};
      output.subscribe(msg => (outMsg = msg));
      input.next({ protagId: collector, targetId: item });
      expect(outMsg).toEqual({
        targetId: item,
        protagId: collector,
        collectedId: item
      });
    });
  });
});
