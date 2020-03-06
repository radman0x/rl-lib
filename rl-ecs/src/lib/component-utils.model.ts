import { AreaOfEffect } from './components/area-of-effect.model';
import { AreaTransition } from './components/area-transition.model';
import { Blockage } from './components/blockage.model';
import { Burn } from './components/burn.model';
import { Climbable } from './components/climbable.model';
import { Combat } from './components/combat.model';
import { DisplayOnly } from './components/display-only.model';
import { Effects } from './components/effects.model';
import { Freeze } from './components/freeze.model';
import { Inventory } from './components/inventory.model';
import { Knowledge } from './components/knowledge.model';
import { Lock } from './components/lock.model';
import { Physical, Size } from './components/physical.model';
import { GridPos, GridPosData } from './components/position.model';
import { Renderable } from './components/renderable.model';
import { FireResistance, ColdResistance } from './components/resistance.model';
import { Sighted } from './components/sighted.model';
import { SingleTarget } from './components/single-target.model';
import { Targeted } from './components/targeted.model';
import { Teleport } from './components/teleport.model';
import { ToggleLock } from './components/toggle-lock.model';
import { Damage } from './components/damage.model';
import { AreaIngress, AreaIngressData } from './components/area-ingress';
import { EndState } from './components/end-state.model';
import { Usable } from './components/usable.model';
import { Fixed } from './components/fixed.model';
import { Description } from './components/description.model';
import { EntityManager } from 'rad-ecs';
import { EgressDirection, Egress } from './areas/area-spec.model';

export function allComponentIndex(): {
  [name: string]: new (...args: any[]) => any;
} {
  return {
    AreaOfEffect: AreaOfEffect,
    AreaIngress: AreaIngress,
    AreaTransition: AreaTransition,
    Blockage: Blockage,
    Burn: Burn,
    Climbable: Climbable,
    Combat: Combat,
    Damage: Damage,
    DisplayOnly: DisplayOnly,
    Effects: Effects,
    Freeze: Freeze,
    Inventory: Inventory,
    Knowledge: Knowledge,
    Lock: Lock,
    Physical: Physical,
    GridPos: GridPos,
    Renderable: Renderable,
    FireResistance: FireResistance,
    ColdResistance: ColdResistance,
    Sighted: Sighted,
    SingleTarget: SingleTarget,
    Targeted: Targeted,
    Teleport: Teleport,
    ToggleLock: ToggleLock,
    EndState: EndState,
    [Usable.name]: Usable,
    Fixed: Fixed,
    Description: Description
  };
}

export function staircasePrefab(
  em: EntityManager,
  position: GridPosData,
  areaIngress: AreaIngressData,
  egress: Egress
) {
  const stairImage = (direction: EgressDirection) =>
    direction === EgressDirection.DOWN ? 'Tile-13.png' : 'Tile-12.png';
  const stairTypeName = (direction: EgressDirection) =>
    direction === EgressDirection.DOWN ? 'down' : 'up';
  em.create(
    new GridPos(position),
    new Renderable({
      image: stairImage(egress.egressDirection),
      zOrder: 0
    }),
    new AreaIngress(areaIngress),
    new Physical({ size: Size.MEDIUM }),
    new Description({
      short: `a staircase ${stairTypeName(egress.egressDirection)}`
    }),
    new Fixed({}),
    new Effects({
      contents: [
        em.create(
          new Climbable(),
          new AreaTransition({
            areaId: egress.egressArea,
            ingressLabel: egress.egressAreaIngressLabel
          })
        ).id
      ]
    })
  );
}
