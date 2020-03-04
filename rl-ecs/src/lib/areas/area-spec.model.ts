import { EntityManager } from 'rad-ecs';

export type IngressLabel = string;
export type AreaLabel = string;

export enum EgressDirection {
  UP,
  DOWN
}
export interface AreaTransitionSpec {
  ingressOnly: IngressLabel[];
  egressOnly: Egress[];
  ingressEgress: IngressEgress[];
}

export interface Egress {
  egressArea: string;
  egressAreaIngressLabel: string;
  egressDirection: EgressDirection;
}

export interface Ingress {
  ingressLabel: IngressLabel;
}

export type IngressEgress = Ingress & Egress;

export type AreaGenerator = (
  em: EntityManager,
  transitionSpec: AreaTransitionSpec
) => void;
