import { EntityManager } from 'rad-ecs';

export type OperationStep<T_InputConstraint = {}, T_OutputAdditions = {}> = <
  T_Input extends T_InputConstraint
>(
  input: T_Input,
  ems: EntityManager[] | EntityManager,
  ...additionalParams: any[]
) => (T_Input & T_OutputAdditions) | null;

export type OperationStepMulti<
  T_InputConstraint = {},
  T_OutputAdditions = {}
> = <T_Input extends T_InputConstraint>(
  input: T_Input,
  ems: EntityManager[] | EntityManager,
  ...additionalParams: any[]
) => (T_Input & T_OutputAdditions)[] | null;

export type OperationStepNoEm<
  T_InputConstraint = {},
  T_OutputAdditions = {}
> = <T_Input extends T_InputConstraint>(
  input: T_Input,
  ...additionalParams: any[]
) => (T_Input & T_OutputAdditions) | null;

export type OperationStepMultiNoEm<
  T_InputConstraint = {},
  T_OutputAdditions = {}
> = <T_Input extends T_InputConstraint>(
  input: T_Input,
  ...additionalParams: any[]
) => (T_Input & T_OutputAdditions)[] | null;
