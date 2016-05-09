/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type { DefaultTraverser } from '../../traverser';

export default class HashSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('HashSelector');
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
  }
}

