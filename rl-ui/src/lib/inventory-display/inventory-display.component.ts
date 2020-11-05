import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Description, Inventory } from '@rad/rl-ecs';
import { MenuItem } from 'primeng/api';
import { EntityId, EntityManager } from 'rad-ecs';

@Component({
  selector: 'rad-inventory-display',
  templateUrl: './inventory-display.component.html',
  styleUrls: ['./inventory-display.component.css'],
})
export class InventoryDisplayComponent implements OnInit {
  @Input() em: EntityManager;
  @Input() inventoryId: EntityId;

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
    if (this.em.hasComponent(this.inventoryId, Inventory)) {
      const inventory = this.em.getComponent(this.inventoryId, Inventory);
      this.updateInventory(inventory);
    }

    this.observeInventory();
  }

  private updateInventory(current: Inventory) {
    const itemEntries = [];
    this.inventoryEntries = [
      { label: 'Inventory', items: itemEntries, expanded: true },
    ];
    for (let id of current.contents) {
      const desc = this.em.getComponent(id, Description);
      if (desc) {
        itemEntries.push({
          label: desc.short,
        });
      }
    }
    this.changeDetector.detectChanges();
  }

  private observeInventory() {
    this.em
      .observeEntityComponent$(this.inventoryId, Inventory)
      .subscribe((change) => {
        if (change.c) {
          this.updateInventory(change.c);
        } else {
          console.log(`Inventory disappeared!? hmmmm..`);
        }
      });
  }
}
