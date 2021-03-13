import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  Description,
  Inventory,
  recursiveObserveEntity,
  Renderable,
  Wearable,
  Wieldable,
} from '@rad/rl-ecs';
import { Equipped } from 'libs/rl-ecs/src/lib/components/equipped.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';

interface Entry {
  desc: string;
  count: number;
  image: string;
  ids: EntityId[];
}

interface Entries {
  [id: string]: Entry;
}

@Component({
  selector: 'rad-inventory-display',
  templateUrl: './inventory-display.component.html',
  styleUrls: ['./inventory-display.component.css'],
})
export class InventoryDisplayComponent implements OnInit {
  @Input() em: EntityManager;
  @Input() inventoryId: EntityId;
  @Output() wield = new Subject<EntityId>();
  @Output() wear = new Subject<EntityId>();

  contextItems = {
    label: 'something',
  };

  public sections: {
    label: string;
    entries: Entries;
  }[];

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.em) {
      throw Error(`EntityManager provided to inventory display was empty!!`);
    }
    if (!this.em.exists(this.inventoryId)) {
      throw Error(
        `Inventory entity with id: ${this.inventoryId} doesn't exist`
      );
    }
    this.sections = [
      {
        label: 'Inventory',
        entries: {
          test: { count: 5, desc: 'something', ids: [1], image: 'aoeueao' },
        },
      },
    ];
    this.update();
    recursiveObserveEntity(this.inventoryId, this.em).subscribe(() =>
      this.update()
    );
  }

  public items() {
    return Object.values(this.sections[0].entries);
  }

  private update() {
    if (this.em.hasComponent(this.inventoryId, Inventory)) {
      const entries: {
        desc: string;
        typeId?: string;
        image: string;
        id: EntityId;
      }[] = [];
      for (let id of this.em.getComponent(this.inventoryId, Inventory)
        .contents) {
        entries.push(this.inventoryItemEntry(id));
      }
      const contents: {
        [id: string]: Entry;
      } = {};
      for (const entry of entries) {
        if (entry.typeId) {
          if (contents[entry.typeId]) {
            ++contents[entry.typeId].count;
            contents[entry.typeId].ids.push(entry.id);
          } else {
            contents[entry.typeId] = {
              desc: entry.desc,
              image: entry.image,
              ids: [entry.id],
              count: 1,
            };
          }
        } else {
          contents[entry.id] = {
            desc: entry.desc,
            image: entry.image,
            ids: [entry.id],
            count: 1,
          };
        }
      }
      this.sections[0].entries = contents;
      console.log(JSON.stringify(this.sections[0].entries, null, 2));
    }

    this.changeDetector.detectChanges();
  }

  private inventoryItemEntry(itemId: EntityId) {
    const desc = this.em.getComponent(itemId, Description)?.short;
    const typeId = this.em.getComponent(itemId, Description)?.typeId;
    const equipped = this.em.hasComponent(itemId, Equipped);
    const image = this.em.getComponent(itemId, Renderable)?.uiImage;
    if (desc) {
      let actions = null;
      if (this.em.hasComponent(itemId, Wieldable)) {
        actions = actions || [];
        const label = equipped ? 'Stop Wielding' : 'Wield';
        actions.push({
          label,
          command: () => this.wield.next(itemId),
        });
      }
      if (this.em.hasComponent(itemId, Wearable)) {
        actions = actions || [];
        const label = equipped ? 'Take off' : 'Wear';
        actions.push({
          label,
          command: () => this.wear.next(itemId),
        });
      }
      return {
        desc: `${desc}${equipped ? ` - EQUIPPED` : ``}`,
        typeId,
        image,
        id: itemId,
      };
    } else {
      return null;
    }
  }
}
