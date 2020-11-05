import { EntityManager } from 'rad-ecs';
import { Egress, EgressDirection } from './areas/area-spec.model';
import { Alignment } from './components/alignment.model';
import { AreaIngress, AreaIngressData } from './components/area-ingress.model';
import { AreaOfEffect } from './components/area-of-effect.model';
import { AreaTransition } from './components/area-transition.model';
import { Blockage } from './components/blockage.model';
import { Burn } from './components/burn.model';
import { Climbable } from './components/climbable.model';
import { Combat } from './components/combat.model';
import { Damage } from './components/damage.model';
import { Description } from './components/description.model';
import { DisplayOnly } from './components/display-only.model';
import { Effects } from './components/effects.model';
import { EndState } from './components/end-state.model';
import { Fixed } from './components/fixed.model';
import { Freeze } from './components/freeze.model';
import { Inventory } from './components/inventory.model';
import { Knowledge } from './components/knowledge.model';
import { Lock } from './components/lock.model';
import { Mobile } from './components/mobile.model';
import { Physical, Size } from './components/physical.model';
import { GridPos, GridPosData } from './components/position.model';
import { Renderable } from './components/renderable.model';
import { ColdResistance, FireResistance } from './components/resistance.model';
import { Sighted } from './components/sighted.model';
import { SingleTarget } from './components/single-target.model';
import { Targeted } from './components/targeted.model';
import { Teleport } from './components/teleport.model';
import { ToggleLock } from './components/toggle-lock.model';
import { Usable } from './components/usable.model';

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
    Description: Description,
    Mobile: Mobile,
    Alignment: Alignment,
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
  const stairActionName = (direction: EgressDirection) =>
    direction === EgressDirection.DOWN ? 'descend' : 'ascend';
  em.create(
    new GridPos(position),
    new Renderable({
      image: stairImage(egress.egressDirection),
      zOrder: 0,
    }),
    new AreaIngress(areaIngress),
    new Physical({ size: Size.SMALL }),
    new Description({
      short: `a staircase ${stairTypeName(egress.egressDirection)}`,
    }),
    new Fixed({}),
    new Effects({
      contents: [
        em.create(
          new Description({
            short: `${stairActionName(egress.egressDirection)} the stairs`,
          }),
          new Climbable(),
          new AreaTransition({
            areaId: egress.egressArea,
            ingressLabel: egress.egressAreaIngressLabel,
          })
        ).id,
      ],
    })
  );
}
