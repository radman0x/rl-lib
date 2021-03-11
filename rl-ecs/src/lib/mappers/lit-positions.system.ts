import { ValueMap } from '@rad/rl-utils';
import { Entity, EntityManager } from 'rad-ecs';
import * as ROT from 'rot-js';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  convertToLightLevel,
  Lighting,
  LightLevel,
} from '../components/light-level.model';
import { LightSource } from '../components/light-source.model';
import { Physical, Size } from '../components/physical.model';
import { GridPos } from '../components/position.model';
import { radClone } from '../systems.utils';

interface Args {
  closedMap: ValueMap<GridPos, boolean>;
  viewerPos: GridPos;
}
export type LitPositionsArgs = Args;

interface Out {}
export type LitPositionsOut = Out;

export function lightPositions(em: EntityManager) {
  const lightPositionsStep = <T extends Args>(input: Observable<T>) => {
    return input.pipe(
      tap((msg) => {
        const { closedMap } = msg;

        let lightFov = new ROT.FOV.PreciseShadowcasting(
          (x: number, y: number) => {
            const currPos = new GridPos({ x, y, z: msg.viewerPos.z });
            const blocked = closedMap.get(currPos) ?? false;
            return !blocked;
          },
          { topology: 8 }
        );

        let lighting = new ROT.Lighting(
          (x: number, y: number) => {
            const currPos = new GridPos({ x, y, z: msg.viewerPos.z });
            return closedMap.get(currPos) ? 0 : 0.12;
          },
          { range: 7, passes: 2 }
        );
        lighting.setFOV(lightFov);

        em.each(
          (e: Entity, l: LightSource, p: GridPos) => {
            lighting.setLight(p.x, p.y, l.strength);
          },
          LightSource,
          GridPos
        );

        const setLightEntity = (
          x: number,
          y: number,
          z: number,
          level: Lighting,
          raw: [number, number, number]
        ) => {
          const pos = { x, y, z };
          let litEntity = em
            .matchingIndex(new GridPos(pos))
            .filter((e: Entity) => e.has(LightLevel))
            .reduce((accum, curr) => curr, null);
          if (litEntity !== null) {
            em.setComponent(litEntity.id, new LightLevel({ level, raw }));
          } else {
            em.create(new GridPos(pos), new LightLevel({ level, raw }));
          }
        };
        lighting.compute(
          (x: number, y: number, c: [number, number, number]) => {
            const level = convertToLightLevel(c);
            setLightEntity(x, y, msg.viewerPos.z, level, c);
            setLightEntity(x, y, msg.viewerPos.z - 1, level, c);
          }
        );
      })
    );
  };

  return lightPositionsStep;
}

type BuildOpenMapArgs = {
  viewerPos: GridPos;
};

export function buildOpenMap(em: EntityManager) {
  const buildOpenMapStep = <T extends BuildOpenMapArgs>(
    input: Observable<T>
  ) => {
    return input.pipe(
      map((msg) => {
        let closedMap = new ValueMap<GridPos, boolean>();
        em.each(
          (e: Entity, p: GridPos, y: Physical) => {
            if (p.z !== msg.viewerPos.z) {
              return;
            }

            if (!closedMap.has(p)) {
              closedMap.set(p, false);
            }
            if (p.z === 0 && y.size === Size.FILL) {
              closedMap.set(p, true);
            }
          },
          GridPos,
          Physical
        );
        return { ...radClone(msg), closedMap };
      })
    );
  };
  return buildOpenMapStep;
}
