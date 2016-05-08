/* @flow */
import Node from './Node';

import type Combinator from './Combinator';
import type SimpleSelectorList from './SimpleSelectorList';
import type Visitor from '../../traverser/visitor';

export default class Selector extends Node {
  body: Array<SimpleSelectorList|Combinator>;

  constructor() {
    super('Selector');
    this.body = [];
  }

  accept(visitor: Visitor): void {
    this.body.forEach(child => visitor.visit(child));
  }
}
