import { Component } from 'rad-ecs';

export class Renderable extends Component {
  public readonly image: string;
  public readonly uiImage: string;
  public readonly zOrder: number;
  public readonly uiElem: boolean;

  constructor(data: {
    image: string;
    uiImage?: string;
    zOrder: number;
    uiElem?: boolean;
  }) {
    super();
    Object.assign(this, data);
  }
}
