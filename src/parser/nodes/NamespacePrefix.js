/* @flow */
import Node from './Node';

import type Identifier from './Identifier';
import type Visitor from '../../traverser/visitor';

export default class NamespacePrefix extends Node {
  namespace: ?Identifier;

  constructor(namespace: ?Identifier) {
    super('NamespacePrefix');
    this.namespace = namespace;
  }

  accept(visitor: Visitor): void {
    if (this.namespace) {
      visitor.visit(this.namespace);
    }
  }
}
