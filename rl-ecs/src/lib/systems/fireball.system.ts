import { OperationStep } from 'src/lib/operation-step.model';
import { EntityManager } from 'rad-ecs';

interface Args {
}
interface Out {
}

function somethingStep<T extends Args>(msg: T, em: EntityManager): T & Out {

  return {...msg};
}

type StepFunc = OperationStep<Args, Out>;
const typeCheck: StepFunc = somethingStep;

export const something = somethingStep;
