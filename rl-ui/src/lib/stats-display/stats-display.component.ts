import { Component, OnInit, Input } from '@angular/core';
import { EntityManager, EntityId } from 'rad-ecs';
import { Martial, Attacks, Wounds, Inventory } from '@rad/rl-ecs';

@Component({
  selector: 'rad-stats-display',
  templateUrl: './stats-display.component.html',
  styleUrls: ['./stats-display.component.css']
})
export class StatsDisplayComponent implements OnInit {
  @Input() em: EntityManager;
  @Input() statsEntityId: EntityId;

  public stats: { desc: string; value: string }[] = [
    { desc: 'WEAPON SKILL', value: '-' },
    { desc: 'STRENGTH', value: '-' },
    { desc: 'TOUGHNESS', value: '-' },
    { desc: 'DAMAGE', value: '-' },
    { desc: 'ARMOR', value: '-' },
    { desc: 'WARD', value: '-' },
    { desc: 'WOUNDS', value: '-' }
  ];

  private WS_INDEX = 0;
  private S_INDEX = 1;
  private T_INDEX = 2;
  private D_INDEX = 3;
  private ARMOR_INDEX = 4;
  private WARD_INDEX = 5;
  private W_INDEX = 6;

  constructor() {}

  ngOnInit() {
    if (!this.em) {
      throw Error(`EntityManager provide to stats display was empty!!`);
    }
    if (!this.em.exists(this.statsEntityId)) {
      throw Error(
        `Inventory entity with id: ${this.statsEntityId} doesn't exist`
      );
    }
    if (this.em.hasComponent(this.statsEntityId, Martial)) {
      const martial = this.em.getComponent(this.statsEntityId, Martial);
      this.setMartial(martial);
    }
    if (this.em.hasComponent(this.statsEntityId, Attacks)) {
      const attacks = this.em.getComponent(this.statsEntityId, Attacks);
      this.stats[this.D_INDEX].value = attacks.damage.toString();
    }
    if (this.em.hasComponent(this.statsEntityId, Wounds)) {
      const wounds = this.em.getComponent(this.statsEntityId, Wounds);
      this.setWounds(wounds);
    }
    this.stats[this.ARMOR_INDEX].value = '-';
    this.stats[this.WARD_INDEX].value = '-';

    this.observeMartialComponent();
    this.observeWoundsComponent();
    this.observeAttacksComponent();

    this.em.observeInitialisation$().subscribe(() => {
      this.observeMartialComponent();
      this.observeWoundsComponent();
      this.observeAttacksComponent();
    });
  }

  private setMartial(martial: Martial) {
    this.stats[this.WS_INDEX].value = martial.weaponSkill.toString();
    this.stats[this.S_INDEX].value = martial.strength.toString();
    this.stats[this.T_INDEX].value = martial.toughness.toString();
  }

  private observeMartialComponent() {
    this.em
      .observeEntityComponent$(this.statsEntityId, Martial)
      .subscribe(change => {
        if (change.c) {
          this.setMartial(change.c);
        } else {
          console.log(`Martial disappeared!? hmmmm..`);
        }
      });
  }

  private setWounds(wounds: Wounds) {
    this.stats[
      this.W_INDEX
    ].value = `${wounds.current.toString()} / ${wounds.max.toString()}`;
  }

  private observeWoundsComponent() {
    this.em
      .observeEntityComponent$(this.statsEntityId, Wounds)
      .subscribe(change => {
        if (change.c) {
          this.setWounds(change.c);
        } else {
          console.log(`Wounds disappeared!? hmmmm..`);
        }
      });
  }

  private setAttacks(attacks: Attacks) {
    this.stats[this.D_INDEX].value = attacks.damage.toString();
  }

  private observeAttacksComponent() {
    this.em
      .observeEntityComponent$(this.statsEntityId, Attacks)
      .subscribe(change => {
        if (change.c) {
          this.setAttacks(change.c);
        } else {
          console.log(`Attacks disappeared!? hmmmm..`);
        }
      });
  }
}
