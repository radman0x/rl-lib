import { Entity, EntityManager } from 'rad-ecs';
import { PassiveEffect } from '../components/passive-effect.model';
import { StatusEffects } from '../components/status-effects.model';
import { StrengthDelta } from '../components/strength-delta.model';
import { Strength } from '../components/strength.model';
import { modifieredEntity } from './modifiered-entity-pipeline.operator';

describe('Modifiered entity pipeline', () => {
  let em: EntityManager;
  beforeEach(() => {
    em = new EntityManager();
  });

  it('should behave well if the modify target entity does not have any modifiers', () => {
    const modifyId = em.create().id;
    const working = new Entity(null);
    const modified = modifieredEntity({ modifyId, working }, em);
    expect(modified).toEqual(working);
  });

  it('should modify a strength component', () => {
    const delta = em.create(
      new StrengthDelta({ change: 2 }),
      new PassiveEffect()
    ).id;
    const modifyId = em.create(
      new Strength({ count: 3 }),
      new StatusEffects({ contents: [delta] })
    ).id;
    const working = new Entity(null, new Strength({ count: 3 }));
    const modified = modifieredEntity({ modifyId, working }, em);
    expect(modified.component(Strength).count).toEqual(5);
  });

  it('should modify when there are multiple modifiers in play', () => {
    const delta = () =>
      em.create(new StrengthDelta({ change: 2 }), new PassiveEffect()).id;
    const modifyId = em.create(
      new Strength({ count: 3 }),
      new StatusEffects({ contents: [delta(), delta()] })
    ).id;
    const working = new Entity(null, new Strength({ count: 3 }));
    const modified = modifieredEntity({ modifyId, working }, em);
    expect(modified.component(Strength).count).toEqual(7);
  });
});
