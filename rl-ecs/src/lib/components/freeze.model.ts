import { DamageType } from '../systems.types';
import { Damage } from './damage.model';

export class Freeze extends Damage {
  constructor(data: { amount: number }) {
    super({ type: DamageType.COLD, amount: data.amount });
  }
}
