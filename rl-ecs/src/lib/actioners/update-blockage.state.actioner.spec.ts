import { EntityManager, EntityId } from 'rad-ecs';
import { updateBlockageState } from './update-blockage.state.actioner';
import { Blockage } from '../components/blockage.model';
import { GridPos } from '../components/position.model';

describe('Update blockage state', () => {
  let em: EntityManager;
  let blockageId: EntityId;
  let active: boolean;
  beforeEach(() => {
    em = new EntityManager();
    active = true;
    blockageId = em.create(new Blockage({ active, triggers: [] })).id;
  });

  it('should update the active state when a trigger successfully indicates only a component', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(activeState);
  });

  it('should update the active state when a trigger successfully indicates a component and a property', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'x',
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(activeState);
  });

  it('should update the active state when a trigger successfully indicates a component, property and a value are set', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'x',
            value: 17,
            activeState: false
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 17, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(activeState);
  });

  it('should do nothing if blockageId is null', () => {
    const result = updateBlockageState({ blockageId: null }, em);
    expect(result).toEqual(null);
  });

  it('should do nothing if the blockage entity has no Blockage component', () => {
    em.removeComponent(blockageId, Blockage);
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(null);
  });

  it('should not update the active state if there are no triggers specified', () => {
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(active);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(active);
  });

  it('should not update the active state if no specified triggers are satsified', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            activeState
          }
        ]
      })
    );
    // dummy GridPos creation needs to be here so that EntityManager knows about the type for retrieval by type name
    em.create(new GridPos({ x: 5, y: 5, z: 5 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(active);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(active);
  });

  it('should not update the active state when a trigger unsuccessfully indicates a component and a property', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'fff',
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(active);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(active);
  });

  it('should not the active state when a trigger unsuccessfully indicates a component, a property and a value', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'x',
            value: 6,
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 17, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(active);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(active);
  });

  it('should update active state when there are 2 triggers and only the first is successful', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'y',
            value: 1,
            activeState
          },
          {
            componentName: GridPos.name,
            property: 'z',
            value: 54521,
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(activeState);
  });

  it('should update active state when there are 2 triggers and only the second is successful', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'z',
            value: 54521,
            activeState
          },
          {
            componentName: GridPos.name,
            property: 'y',
            value: 1,
            activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(activeState);
  });

  /** Triggers are evaluated in order and therefore the last takes precedence
   */
  it('should update active state when there are 2 triggers and both are successful', () => {
    const activeState = false;
    em.setComponent(
      blockageId,
      new Blockage({
        active,
        triggers: [
          {
            componentName: GridPos.name,
            property: 'z',
            value: 1,
            activeState
          },
          {
            componentName: GridPos.name,
            property: 'y',
            value: 1,
            activeState: !activeState
          }
        ]
      })
    );
    em.setComponent(blockageId, new GridPos({ x: 1, y: 1, z: 1 }));
    const result = updateBlockageState({ blockageId }, em);
    expect(result).toEqual(!activeState);
    expect(em.getComponent(blockageId, Blockage).active).toEqual(!activeState);
  });
});
