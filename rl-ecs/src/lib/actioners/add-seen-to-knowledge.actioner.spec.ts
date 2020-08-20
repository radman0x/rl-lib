import { addSeenToKnowledge } from './add-seen-to-knowledge.actioner';
import { EntityManager, EntityId } from 'rad-ecs';
import { ValueMap } from '@rad/rl-utils';
import { Knowledge } from '../components/knowledge.model';
import { GridPos } from '../components/position.model';

describe('Add Seen to knowledge', () => {
  let em: EntityManager;
  let id: EntityId;
  beforeEach(() => {
    em = new EntityManager();
    id = em.create(
      new Knowledge({ current: new ValueMap(), history: new ValueMap() })
    ).id;
  });

  it('should update the knowledge for the simplest case', () => {
    const thePos = { x: 1, y: 1, z: 1 };
    addSeenToKnowledge(em, {
      [id]: {
        xxx: {
          // key is irrelevant here, but normally would be set properly
          pos: new GridPos(thePos),
          entityIds: [1, 2, 3]
        }
      }
    });
    const current = em.getComponent(id, Knowledge).current;
    expect(current.get(new GridPos(thePos))).toEqual([1, 2, 3]);
  });

  it('should do nothing if the input data is null', () => {
    addSeenToKnowledge(em, null);
    const current = em.getComponent(id, Knowledge).current;
    expect(current).toEqual(new ValueMap());
  });
});
