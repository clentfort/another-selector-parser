/* @flow */
import Combinator from './Combinator';
import Node from './Node';
import SimpleSelectorSequence from './SimpleSelectorSequence';

export default class Selector extends Node {
  body: Array<SimpleSelectorSequence|Combinator>;

  constructor() {
    super('Selector');
    this.body = [];
  }
}
