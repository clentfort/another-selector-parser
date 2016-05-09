/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type { DefaultTraverser } from '../../traverser';

export default class ClassSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('ClassSelector');
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
  }
}
