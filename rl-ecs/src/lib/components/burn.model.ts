import { DamageType } from '../systems.types';
import { Damage } from './damage.model';

export class Burn extends Damage {
  constructor(data: { amount: number }) {
    super({ type: DamageType.FIRE, amount: data.amount });
  }
}
