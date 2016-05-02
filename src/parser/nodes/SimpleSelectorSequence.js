/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

export default class SimpleSelectorSequence extends Node {
  body: Array<SimpleSelector>;

  constructor() {
    super('SimpleSelectorSequence');
    this.body = [];
  }
}

