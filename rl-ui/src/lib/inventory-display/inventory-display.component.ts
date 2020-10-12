import { Component, Input, OnInit } from '@angular/core';
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

  constructor() {}

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
    // this.inventoryEntries.length = 0;
    const itemEntries = [];
    this.inventoryEntries = [{ label: 'Items', items: itemEntries }];
    for (let id of current.contents) {
      const desc = this.em.getComponent(id, Description);
      if (desc) {
        itemEntries.push({
          label: desc.short,
        });
      }
    }
    // this.inventoryEntries = [{ label: 'File', icon: 'pi pi-w pi-file' }];
    // this.inventoryEntries = [
    //   {
    //     label: 'File',
    //     icon: 'pi pi-pw pi-file',
    //     items: [
    //       {
    //         label: 'New',
    //         icon: 'pi pi-fw pi-plus',
    //         items: [
    //           { label: 'User', icon: 'pi pi-fw pi-user-plus' },
    //           { label: 'Filter', icon: 'pi pi-fw pi-filter' },
    //         ],
    //       },
    //       { label: 'Open', icon: 'pi pi-fw pi-external-link' },
    //       { separator: true },
    //       { label: 'Quit', icon: 'pi pi-fw pi-times' },
    //     ],
    //   },
    //   {
    //     label: 'Edit',
    //     icon: 'pi pi-fw pi-pencil',
    //     items: [
    //       { label: 'Delete', icon: 'pi pi-fw pi-trash' },
    //       { label: 'Refresh', icon: 'pi pi-fw pi-refresh' },
    //     ],
    //   },
    //   {
    //     label: 'Help',
    //     icon: 'pi pi-fw pi-question',
    //     items: [
    //       {
    //         label: 'Contents',
    //         icon: 'pi pi-pi pi-bars',
    //       },
    //       {
    //         label: 'Search',
    //         icon: 'pi pi-pi pi-search',
    //         items: [
    //           {
    //             label: 'Text',
    //             items: [
    //               {
    //                 label: 'Workspace',
    //               },
    //             ],
    //           },
    //           {
    //             label: 'User',
    //             icon: 'pi pi-fw pi-file',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   {
    //     label: 'Actions',
    //     icon: 'pi pi-fw pi-cog',
    //     items: [
    //       {
    //         label: 'Edit',
    //         icon: 'pi pi-fw pi-pencil',
    //         items: [
    //           { label: 'Save', icon: 'pi pi-fw pi-save' },
    //           { label: 'Update', icon: 'pi pi-fw pi-save' },
    //         ],
    //       },
    //       {
    //         label: 'Other',
    //         icon: 'pi pi-fw pi-tags',
    //         items: [{ label: 'Delete', icon: 'pi pi-fw pi-minus' }],
    //       },
    //     ],
    //   },
    // ];
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
