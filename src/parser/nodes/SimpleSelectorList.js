/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

export default class SimpleSelectorList extends Node {
  body: Array<SimpleSelector>;

  constructor() {
    super('SimpleSelectorList');
    this.body = [];
  }
}

