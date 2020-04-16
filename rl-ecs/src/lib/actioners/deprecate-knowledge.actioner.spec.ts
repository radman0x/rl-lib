import { ValueMap } from '@rad/rl-utils';
import { EntityId, EntityManager } from 'rad-ecs';
import { Knowledge } from '../components/knowledge.model';
import { GridPos } from '../components/position.model';
import { deprecateKnowledge } from './deprecate-knowledge.actioner';

describe('Update knowledge', () => {
  let em: EntityManager;
  let knowledgeId: EntityId;
  let knowledgeMap: ValueMap<GridPos, number[]>;
  beforeEach(() => {
    em = new EntityManager();
    knowledgeMap = new ValueMap<GridPos, number[]>();
    knowledgeMap.set(new GridPos({ x: 1, y: 1, z: 1 }), [1, 2, 3]);
    knowledgeId = em.create(
      new Knowledge({ current: knowledgeMap, history: new ValueMap() })
    ).id;
  });
  it('Swap the knowledge of the entity', () => {
    deprecateKnowledge({ knowledgeId }, em);
    const knowledge = em.getComponent(knowledgeId, Knowledge);
    expect(knowledge.history).toEqual(knowledgeMap);
    expect(knowledge.current).toEqual(new ValueMap());
  });
  it('should do nothing if an entityId is not provided', () => {
    deprecateKnowledge({ knowledgeId: null }, em);
    const knowledge = em.getComponent(knowledgeId, Knowledge);
    expect(knowledge.current).toEqual(knowledgeMap);
    expect(knowledge.history).toEqual(new ValueMap());
  });
});
