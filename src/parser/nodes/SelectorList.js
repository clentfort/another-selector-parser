/* @flow */
import Node from './Node';
import Selector from './Selector';

export default class SelectorList extends Node {
  body: Array<Selector>;

  constructor() {
    super('SelectorList');
    this.body = [];
  }
}
