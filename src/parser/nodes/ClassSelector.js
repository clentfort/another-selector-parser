/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type Visitor from '../../traverser/visitor';

export default class ClassSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('ClassSelector');
    this.value = value;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.value);
  }
}
