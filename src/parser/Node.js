export class Node {
  _type: string;
  _position: number;

  constructor(type: string, position: number) {
    this._type = type;
    this._position = position;
  }
}
