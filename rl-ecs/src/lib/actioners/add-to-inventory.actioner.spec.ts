import { EntityId, EntityManager } from 'rad-ecs';
import { Inventory } from '../components/inventory.model';
import { GridPos } from '../components/position.model';
import {
  addToInventory,
  AddToInventoryArgs
} from './add-to-inventory.actioner';

describe('Add to inventory', () => {
  let em: EntityManager;
  let collectibleId: EntityId;
  let collectorId: EntityId;
  let msg: AddToInventoryArgs;
  beforeEach(() => {
    em = new EntityManager();
    em.indexBy(GridPos);
    collectibleId = em.create().id;
    collectorId = em.create(new Inventory({ contents: [] })).id;
    msg = { collectorId, collectibleId };
  });

  it('should add the entity to the inventory of the target', () => {
    addToInventory(msg, em);
    expect(em.getComponent(collectorId, Inventory)!.contents).toContain(
      collectibleId
    );
  });

  it('should throw if the collector does NOT have an inventory component', () => {
    em.removeComponent(collectorId, Inventory);
    expect(() => addToInventory(msg, em)).toThrow();
  });

  it('should remove the grid position from the entity added', () => {
    em.setComponent(collectibleId, new GridPos({ x: 0, y: 0, z: 0 }));
    addToInventory(msg, em);
    expect(em.getComponent(collectibleId, GridPos)).toEqual(undefined);
  });
});
