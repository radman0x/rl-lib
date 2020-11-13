import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  Armor,
  Attacks,
  getModifiedComponent,
  Martial,
  recursiveObserveEntity,
  Wounds,
} from '@rad/rl-ecs';
import { Damage } from 'libs/rl-ecs/src/lib/components/damage.model';
import { Strength } from 'libs/rl-ecs/src/lib/components/strength.model';
import { Toughness } from 'libs/rl-ecs/src/lib/components/toughness.model';
import { WeaponSkill } from 'libs/rl-ecs/src/lib/components/weapon-skill.model';
import { EntityId, EntityManager } from 'rad-ecs';

@Component({
  selector: 'rad-stats-display',
  templateUrl: './stats-display.component.html',
  styleUrls: ['./stats-display.component.css'],
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
    { desc: 'WOUNDS', value: '-' },
  ];

  private WS_INDEX = 0;
  private S_INDEX = 1;
  private T_INDEX = 2;
  private D_INDEX = 3;
  private ARMOR_INDEX = 4;
  private WARD_INDEX = 5;
  private W_INDEX = 6;

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.em) {
      throw Error(`EntityManager provided to stats display was empty!!`);
    }
    if (!this.em.exists(this.statsEntityId)) {
      throw Error(
        `Inventory entity with id: ${this.statsEntityId} doesn't exist`
      );
    }

    this.updateValues();

    recursiveObserveEntity(this.statsEntityId, this.em).subscribe(() =>
      this.updateValues()
    );
  }

  updateValues() {
    this.updateValue(WeaponSkill, this.WS_INDEX, (ws) => ws.count.toString());
    this.updateValue(Strength, this.S_INDEX, (s) => s.count.toString());
    this.updateValue(Toughness, this.T_INDEX, (t) => t.count.toString());
    this.updateValue(Attacks, this.D_INDEX, (a) => a.damage.toString());
    this.updateValue(Wounds, this.W_INDEX, (w) => w.current.toString());
    this.updateValue(Armor, this.ARMOR_INDEX, (arm) => arm.count.toString());

    this.changeDetector.detectChanges();
  }

  private updateValue<
    T extends
      | typeof Strength
      | typeof Toughness
      | typeof Attacks
      | typeof Wounds
      | typeof Armor
  >(
    componentType: T,
    index: number,
    extractor: (c: InstanceType<T>) => string
  ) {
    const value = getModifiedComponent(
      this.statsEntityId,
      componentType,
      this.em
    );
    if (value) {
      this.stats[index].value = extractor(value);
    }
  }
}
