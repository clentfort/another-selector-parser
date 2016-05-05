/* @flow */
import Combinator from './Combinator';
import Node from './Node';
import SimpleSelectorList from './SimpleSelectorList';

export default class Selector extends Node {
  body: Array<SimpleSelectorList|Combinator>;

  constructor() {
    super('Selector');
    this.body = [];
  }
}
