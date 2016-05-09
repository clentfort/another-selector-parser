/* @flow */
import Node from './Node';

import type Identifier from './Identifier';
import type { DefaultTraverser } from '../../traverser';

export default class NamespacePrefix extends Node {
  value: ?Identifier;

  constructor(value: ?Identifier) {
    super('NamespacePrefix');
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    if (this.value) {
      traverser.visit(this.value);
    }
  }
}
