/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type Visitor from '../../traverser/visitor';

export default class HashSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('HashSelector');
    this.value = value;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.value);
  }
}

