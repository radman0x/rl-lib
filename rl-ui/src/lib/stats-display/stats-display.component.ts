import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  Armor,
  Attacks,
  getModifiedComponent,
  recursiveObserveEntity,
  Wounds,
} from '@rad/rl-ecs';
import { Strength } from 'libs/rl-ecs/src/lib/components/strength.model';
import { Toughness } from 'libs/rl-ecs/src/lib/components/toughness.model';
import { WeaponSkill } from 'libs/rl-ecs/src/lib/components/weapon-skill.model';
import { EntityId, EntityManager } from 'rad-ecs';

enum PercentColors {
  VERY_HIGH = `#11970E`,
  HIGH = `#FFFF00`,
  MODERATE = `#D17700`,
  LOW = `#FF5733`,
  VERY_LOW = `#C70039`,
}

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
  ];

  public wounds: Wounds | null = null;

  private WS_INDEX = 0;
  private S_INDEX = 1;
  private T_INDEX = 2;
  private D_INDEX = 3;
  private ARMOR_INDEX = 4;
  private WARD_INDEX = 5;

  public woundDisplayWidth = 200;

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
    this.updateValue(Armor, this.ARMOR_INDEX, (arm) => arm.count.toString());
    this.updateWounds();

    this.changeDetector.detectChanges();
  }

  public woundsStyle() {
    const woundPercent = this.wounds.current / this.wounds.max;
    let color = '';
    if (woundPercent >= 0.8) {
      color = PercentColors.VERY_HIGH;
    } else if (woundPercent >= 0.6) {
      color = PercentColors.HIGH;
    } else if (woundPercent >= 0.4) {
      color = PercentColors.MODERATE;
    } else if (woundPercent >= 0.2) {
      color = PercentColors.LOW;
    } else {
      color = PercentColors.VERY_LOW;
    }

    return {
      width: `${this.woundDisplayWidth * woundPercent}px`,
      backgroundColor: color,
      fontWeight: 'bold',
    };
  }

  public woundText() {
    const woundPercent = this.wounds.current / this.wounds.max;
    let color = `#FFFFFF`;
    if (woundPercent >= 0.6) {
      color = `#888888`;
    }

    return {
      color,
    };
  }

  private updateWounds() {
    this.wounds = getModifiedComponent(this.statsEntityId, Wounds, this.em);
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
