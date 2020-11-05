import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Description, Abilities, Cooldown } from '@rad/rl-ecs';
import { MenuItem } from 'primeng/api';
import { Entity, EntityId, EntityManager } from 'rad-ecs';

@Component({
  selector: 'rad-abilities-display',
  templateUrl: './abilities-display.component.html',
  styleUrls: ['./abilities-display.component.css'],
})
export class AbilitiesDisplayComponent implements OnInit {
  @Input() em: EntityManager;
  @Input() abilitiesId: EntityId;

  public abilityEntries: MenuItem[] = [];

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.em) {
      throw Error(`EntityManager provided to abilities display was empty!!`);
    }
    if (!this.em.exists(this.abilitiesId)) {
      throw Error(
        `Abilities entity with id: ${this.abilitiesId} doesn't exist`
      );
    }
    if (this.em.hasComponent(this.abilitiesId, Abilities)) {
      const abilities = this.em.getComponent(this.abilitiesId, Abilities);
      this.updateAbilities(abilities);
    }

    this.observeAbilities();
  }

  private updateAbilities(current: Abilities) {
    console.log(`Updating abilities`);
    const abilityEntries = [];
    this.abilityEntries = [
      { label: 'Abilities', items: abilityEntries, expanded: true },
    ];
    for (let id of current.contents) {
      const [desc, cooldown] = this.em.getComponents(id, Description, Cooldown);

      if (desc) {
        abilityEntries.push({
          label: `${desc.short} - ${cooldown.curr}`,
          badge: 5,
          id,
        });

        this.observeAbility(id);
      }
    }
  }

  private observeAbilities() {
    console.log(`Abilities changed`);
    this.em
      .observeEntityComponent$(this.abilitiesId, Abilities)
      .subscribe((change) => {
        if (change.c) {
          this.updateAbilities(change.c);
          this.changeDetector.detectChanges();
        } else {
          console.log(`Abilities disappeared!? hmmmm..`);
        }
      });
  }

  private observeAbility(id: EntityId) {
    this.em.observeEntity$(id).subscribe((entity) => {
      if (entity) {
        this.updateEntry(entity);
        this.changeDetector.detectChanges();
      } else {
        console.log(`Ability entity removed`);
      }
    });
  }

  private updateEntry(e: Entity) {
    const [desc, cooldown] = e.components(Description, Cooldown);
    for (let entry of this.abilityEntries[0].items) {
      if (+entry.id === e.id) {
        entry.label = `${desc.short} - ${cooldown.curr}`;
      }
    }
  }
}
