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
  Wieldable,
} from '@rad/rl-ecs';
import { Equipped } from 'libs/rl-ecs/src/lib/components/equipped.model';
import { MenuItem } from 'primeng/api';
import { Entity, EntityId, EntityManager } from 'rad-ecs';
import { Subject } from 'rxjs';

@Component({
  selector: 'rad-inventory-display',
  templateUrl: './inventory-display.component.html',
  styleUrls: ['./inventory-display.component.css'],
})
export class InventoryDisplayComponent implements OnInit {
  @Input() em: EntityManager;
  @Input() inventoryId: EntityId;
  @Output() wield = new Subject<EntityId>();

  contextItems = {
    label: 'something',
  };

  public inventoryEntries: MenuItem[] = [];

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
    this.inventoryEntries = [{ label: 'Inventory', items: [], expanded: true }];
    this.update();
    recursiveObserveEntity(this.inventoryId, this.em).subscribe(() =>
      this.update()
    );
  }

  private update() {
    if (this.em.hasComponent(this.inventoryId, Inventory)) {
      for (let id of this.em.getComponent(this.inventoryId, Inventory)
        .contents) {
        const entry = this.inventoryItemEntry(id);
        const existing = this.inventoryEntries[0].items.find(
          (entry) => entry.id === id.toString()
        );
        if (existing) {
          Object.assign(existing, entry);
        } else {
          this.inventoryEntries[0].items.push(entry);
        }
      }
    }
    this.changeDetector.detectChanges();
  }

  private inventoryItemEntry(itemId: EntityId): MenuItem | null {
    const desc = this.em.getComponent(itemId, Description);
    const equipped = this.em.hasComponent(itemId, Equipped)
      ? ` - EQUIPPED`
      : ``;
    if (desc) {
      let actions = null;
      if (this.em.hasComponent(itemId, Wieldable)) {
        actions = actions || [];
        const label = this.em.hasComponent(itemId, Equipped)
          ? 'Stop Wielding'
          : 'Wield';
        actions.push({
          label,
          command: () => this.wield.next(itemId),
        });
      }
      return {
        label: `${desc.short}${equipped}`,
        items: actions,
        id: itemId.toString(),
      };
    } else {
      return null;
    }
  }
}
