/* @flow */
import Node from './Node';

import type SimpleSelector from './SimpleSelector';
import type Visitor from '../../traverser/visitor';

export default class SimpleSelectorList extends Node {
  body: Array<SimpleSelector>;

  constructor() {
    super('SimpleSelectorList');
    this.body = [];
  }

  accept(visitor: Visitor): void {
    this.body.forEach(child => visitor.visit(child));
  }
}

