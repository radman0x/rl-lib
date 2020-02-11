import { SystemOrganiser } from './system-organiser.util';
import { EntityManager, EntityId } from 'rad-ecs';
import { CompassDirection, Logger } from '../ecs.types';
import { GridPos, GridPosData } from '../components/position.model';
import { Physical, Size, Integrity } from '../components/physical.model';
import { Burn } from '../components/burn.model';
import { SingleTarget } from '../components/single-target.model';
import { FireResistance } from '../components/resistance.model';
import { AreaOfEffect } from '../components/area-of-effect.model';
import { Inventory } from '../components/inventory.model';
import { Targeted } from '../components/targeted.model';
import { Renderable } from '../components/renderable.model';
import { Lock, LockState } from '../components/lock.model';
import { ToggleLock } from '../components/toggle-lock.model';
import { Blockage } from '../components/blockage.model';

interface Basics {
  em: EntityManager;
  org: SystemOrganiser;
  logger: Logger;
}

function theBasics(): Basics {
  const em = new EntityManager();
  const logger = msg => console.log(`LOG: ${msg}`);
  em.indexBy(GridPos);
  const org = new SystemOrganiser(em, logger);
  return { em, logger, org };
}

describe('System organiser utility', () => {
  describe('Door opening / closing', () => {
    let basics: Basics;
    let doorPos: GridPos;
    let toggleEffect: EntityId;
    let lockedImage: string;
    let unlockedImage: string;
    let lock: EntityId;
    beforeEach(() => {
      basics = theBasics();
      doorPos = new GridPos({ x: 0, y: 0, z: 0 });
      toggleEffect = basics.em.createEntity(
        new Targeted({ range: 1 }),
        new ToggleLock({ lockId: 'X' }),
        new SingleTarget()
      ).id;
      lockedImage = 'locked-image';
      unlockedImage = 'unlocked-image';
      lock = basics.em.createEntity(
        doorPos,
        new Renderable({ image: 'start-image', zOrder: 100 }),
        new Lock({
          state: LockState.LOCKED,
          lockId: 'X',
          stateImages: {
            [LockState.LOCKED]: 'locked-image',
            [LockState.UNLOCKED]: 'unlocked-image'
          }
        })
      ).id;
    });
    it('should toggle the lock state once', () => {
      basics.org.applyTargetedEffect$.next({
        effectId: toggleEffect,
        selectedPos: { ...doorPos }
      });
      expect(basics.em.getComponent(lock, Lock)!.state).toEqual(
        LockState.UNLOCKED
      );
      expect(basics.em.getComponent(lock, Renderable)!.image).toEqual(
        unlockedImage
      );
    });

    it('should toggle the open state multiple times', () => {
      basics.org.applyTargetedEffect$.next({
        effectId: toggleEffect,
        selectedPos: { ...doorPos }
      });
      basics.org.applyTargetedEffect$.next({
        effectId: toggleEffect,
        selectedPos: { ...doorPos }
      });
      expect(basics.em.getComponent(lock, Lock)!.state).toEqual(
        LockState.LOCKED
      );
      expect(basics.em.getComponent(lock, Renderable)!.image).toEqual(
        lockedImage
      );
    });

    it('should activate/deactivate a blockage as appropriate', () => {
      basics.em.setComponent(
        lock,
        new Blockage({
          active: true,
          triggers: [
            {
              componentName: Lock.name,
              property: 'state',
              value: LockState.LOCKED,
              active: true
            },
            {
              componentName: Lock.name,
              property: 'state',
              value: LockState.UNLOCKED,
              active: false
            }
          ]
        })
      );
      basics.org.applyTargetedEffect$.next({
        effectId: toggleEffect,
        selectedPos: { ...doorPos }
      });
      expect(basics.em.getComponent(lock, Blockage)!.active).toEqual(false);
      basics.org.applyTargetedEffect$.next({
        effectId: toggleEffect,
        selectedPos: { ...doorPos }
      });
      expect(basics.em.getComponent(lock, Blockage)!.active).toEqual(true);
    });
  });

  describe('Movement', () => {
    let basics: Basics;
    let startPos: GridPos;
    let endPos: GridPos;
    let endGroupPos: GridPos;
    let mover: EntityId;
    let ground: EntityId;
    beforeEach(() => {
      basics = theBasics();
      startPos = new GridPos({ x: 1, y: 1, z: 1 });
      endPos = new GridPos({ x: 2, y: 1, z: 1 });
      endGroupPos = new GridPos({ x: 2, y: 1, z: 0 });
      mover = basics.em.createEntity(new GridPos(startPos)).id;
      ground = basics.em.createEntity(
        new GridPos(endGroupPos),
        new Physical({ size: Size.FILL })
      ).id;
    });
    it('should fail to move an entity if no ground exists to stand on', () => {
      basics.em.remove(ground);
      basics.org.moveRequest$.next({
        protagId: mover,
        direction: CompassDirection.E
      });
      expect(basics.em.getComponent(mover, GridPos)).toEqual(startPos);
    });

    it('should fail to move if another entity is filling the target space', () => {
      basics.em.createEntity(endPos, new Physical({ size: Size.FILL }));

      basics.org.moveRequest$.next({
        protagId: mover,
        direction: CompassDirection.E
      });
      expect(basics.em.getComponent(mover, GridPos)).toEqual(startPos);
    });

    it('should fail to move if another entity is blocking the target', () => {
      basics.em.createEntity(
        endPos,
        new Blockage({ active: true, triggers: [] })
      );

      basics.org.moveRequest$.next({
        protagId: mover,
        direction: CompassDirection.E
      });
      expect(basics.em.getComponent(mover, GridPos)).toEqual(startPos);
    });

    it('should successfully move an entity in a direction', () => {
      basics.org.moveRequest$.next({
        protagId: mover,
        direction: CompassDirection.E
      });
      expect(basics.em.getComponent(mover, GridPos)).toEqual(
        new GridPos(endPos)
      );
    });
  });

  describe('Item collection', () => {
    let basics: Basics;
    let actionPos: GridPos;
    let collectorId: EntityId;
    let itemId: EntityId;
    beforeEach(() => {
      basics = theBasics();
      actionPos = new GridPos({ x: 1, y: 1, z: 1 });
      collectorId = basics.em.createEntity(
        new Inventory({ contents: [] }),
        new GridPos(actionPos)
      ).id;
      itemId = basics.em.createEntity(new GridPos(actionPos)).id;
    });
    it('should successfully add an item to the inventory of the protagonist', () => {
      basics.org.requestCollectLocal$.next({ protagId: collectorId });

      expect(
        basics.em.getComponent(collectorId, Inventory)!.contents
      ).toContain(itemId);
    });

    it('should add an item after a save and load of the ecs', () => {
      const data = basics.em.toData();
      basics.em.fromData(data, {
        GridPos,
        Inventory
      });
      basics.org.requestCollectLocal$.next({ protagId: collectorId });

      expect(
        basics.em.getComponent(collectorId, Inventory)!.contents
      ).toContain(itemId);
    });
  });

  describe('Effect processing', () => {
    let basics: Basics;
    let effect: EntityId;
    let target: EntityId;
    let targetPos: GridPos;
    let target2: EntityId;
    beforeEach(() => {
      basics = theBasics();
      targetPos = new GridPos({ x: 1, y: 1, z: 1 });
      effect = basics.em.createEntity(
        new Burn({ amount: 500 }),
        new SingleTarget()
      ).id;

      target = basics.em.createEntity(
        new GridPos({ ...targetPos }),
        new Integrity({ max: 100, current: 100 })
      ).id;
      target2 = basics.em.createEntity(
        new GridPos({ x: 2, y: 2, z: 1 }),
        new FireResistance({ factor: 5 }),
        new Integrity({ max: 100, current: 100 })
      ).id;
    });
    it('should remove an entity by sustaining damage', () => {
      basics.org.applyTargetedEffect$.next({
        effectId: effect,
        selectedPos: new GridPos(targetPos)
      });

      expect(() => basics.em.get(target)).toThrow();
    });
    it('should remove an entity by sustaining damage when it has some fire resistance', () => {
      basics.em.setComponent(target, new FireResistance({ factor: 5 }));
      basics.org.applyTargetedEffect$.next({
        effectId: effect,
        selectedPos: new GridPos(targetPos)
      });

      expect(() => basics.em.get(target)).toThrow();
    });

    it('should fail to remove an entity if it has too much resistance', () => {
      basics.em.setComponent(target, new FireResistance({ factor: 1000 }));
      basics.org.applyTargetedEffect$.next({
        effectId: effect,
        selectedPos: new GridPos(targetPos)
      });

      expect(() => basics.em.get(target)).not.toThrow();
    });

    it('should process an AOE burn effect', () => {
      basics.em.removeComponent(effect, SingleTarget);
      basics.em.setComponent(effect, new AreaOfEffect({ radius: 1 }));
      basics.org.applyTargetedEffect$.next({
        effectId: effect,
        selectedPos: targetPos
      });

      expect(() => basics.em.get(target)).toThrow();
      expect(() => basics.em.get(target2)).toThrow();
    });
  });
});
