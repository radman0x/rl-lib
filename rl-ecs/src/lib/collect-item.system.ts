import { Subject, merge } from 'rxjs';
import { ProtagonistEntity, TargetEntity, Collected } from './systems.types';
import { hookAddToInventory } from './mappers/add-to-inventory.system';
import { reduce } from 'rxjs/operators';
import { EntityManager } from 'rad-ecs';

export function collectItemFlow(em: EntityManager) {
  // const flowPoints = {
  //   requestCollectItem$: new Subject<ProtagonistEntity>(),
  //   attemptCollection$: new Subject<ProtagonistEntity & TargetEntity>(),
  //   itemCollected$: new Subject<ProtagonistEntity & TargetEntity & Collected>(),
  //   itemsCollected$: new Subject<Collected[]>()
  // };
  // hookEntitiesAtProtagPos(
  //   flowPoints.requestCollectItem$,
  //   flowPoints.attemptCollection$,
  //   em
  // );
  // hookAddToInventory(
  //   flowPoints.attemptCollection$,
  //   flowPoints.itemCollected$,
  //   em
  // );
  // flowPoints.itemCollected$
  //   .pipe(
  //     reduce(
  //       (acc, curr) => {
  //         acc.push(curr);
  //         return acc;
  //       },
  //       [] as (ProtagonistEntity & TargetEntity & Collected)[]
  //     )
  //   )
  //   .subscribe(flowPoints.itemsCollected$);
  // const collectItemFinished$ = new Subject<void>();
  // merge(...Object.values(flowPoints)).subscribe({
  //   complete: () => collectItemFinished$.next()
  // });
  // return { ...flowPoints, collectItemFinished$ };
}
