import { EntityId, EntityManager } from 'rad-ecs';
import { Knowledge } from '../components/knowledge.model';
import { ValueMap } from '@rad/rl-utils';

export function deprecateKnowledge(
  msg: { knowledgeId: EntityId | null },
  em: EntityManager
) {
  if (msg.knowledgeId === null) {
    return;
  }
  const knowledge = em.getComponent(msg.knowledgeId, Knowledge);
  for (const [pos, ids] of knowledge.current) {
    knowledge.history.set(pos, ids);
  }
  em.setComponent(
    msg.knowledgeId,
    new Knowledge({
      current: new ValueMap(),
      history: knowledge.history
    })
  );
}
