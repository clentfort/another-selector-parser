/* @flow */
import Node from './Node';

import type Selector from './Selector';
import type Visitor from '../../traverser/visitor';

export default class SelectorList extends Node {
  body: Array<Selector>;

  constructor() {
    super('SelectorList');
    this.body = [];
  }

  accept(visitor: Visitor): void {
    this.body.forEach(child => visitor.visit(child));
  }
}
