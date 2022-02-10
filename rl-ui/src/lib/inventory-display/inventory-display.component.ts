import { ChangeDetectorRef, Component, Input, OnInit, Output } from '@angular/core';
import {
  Description,
  Effects,
  Inventory,
  recursiveObserveEntity,
  Renderable,
  Usable,
  Wearable,
  Wieldable,
} from '@rad/rl-ecs';
import { Equipped } from 'libs/rl-ecs/src/lib/components/equipped.model';
import { EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Entry {
  desc: string;
  count: number;
  image: string;
  ids: EntityId[];
  action: () => void;
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
  @Input() disableInteraction: boolean;
  @Output() use = new Subject<EntityId>();
  @Output() wield = new Subject<EntityId>();
  @Output() wear = new Subject<EntityId>();
  @Output() drop = new Subject<EntityId>();

  contextItems = {
    label: 'something',
  };

  public sections: {
    label: string;
    entries: Entries;
  }[] = [];

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.em) {
      throw Error(`EntityManager provided to inventory display was empty!!`);
    }
    if (!this.em.exists(this.inventoryId)) {
      throw Error(`Inventory entity with id: ${this.inventoryId} doesn't exist`);
    }
    this.sections = [
      {
        label: 'Inventory',
        entries: {},
      },
    ];

    this.update();
    recursiveObserveEntity(this.inventoryId, this.em)
      .pipe(debounceTime(50))
      .subscribe(() => this.update());
  }

  public items() {
    return Object.values(this.sections[0].entries);
  }

  useItem(itemId: EntityId) {
    if (!this.disableInteraction) {
      this.use.next(itemId);
    }
  }

  dropItem(itemId: EntityId) {
    this.drop.next(itemId);
    return false;
  }

  private update() {
    if (this.em.hasComponent(this.inventoryId, Inventory)) {
      let entries: {
        desc: string;
        typeId?: string;
        image: string;
        id: EntityId;
        action: () => void;
        equippable: number;
      }[] = [];
      for (let id of this.em.getComponent(this.inventoryId, Inventory).contents) {
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
              action: entry.action,
            };
          }
        } else {
          contents[entry.id] = {
            desc: entry.desc,
            image: entry.image,
            ids: [entry.id],
            count: 1,
            action: entry.action,
          };
        }
      }
      this.sections[0].entries = contents;
    }

    this.changeDetector.detectChanges();
  }

  private inventoryItemEntry(itemId: EntityId) {
    const desc = this.em.getComponent(itemId, Description)?.short;
    const typeId = this.em.getComponent(itemId, Description)?.typeId;
    const equipped = this.em.hasComponent(itemId, Equipped);
    const image = this.em.getComponent(itemId, Renderable)?.uiImage;
    const effects = this.em.getComponent(itemId, Effects);
    if (desc) {
      let action: () => void = () => null;
      let equippable = 100;
      if (this.em.hasComponent(itemId, Wieldable)) {
        action = () => this.wield.next(itemId);
        equippable = 20;
      } else if (this.em.hasComponent(itemId, Wearable)) {
        action = () => this.wear.next(itemId);
        equippable = 30;
      } else if (effects.contents.filter((id) => this.em.hasComponent(id, Usable)).length) {
        action = () => this.useItem(itemId);
      }

      return {
        desc: `${desc}${equipped ? ` - EQUIPPED` : ``}`,
        typeId,
        image,
        id: itemId,
        action,
        equippable,
      };
    } else {
      return null;
    }
  }
}
