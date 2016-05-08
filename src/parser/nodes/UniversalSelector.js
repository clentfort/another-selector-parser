/* @flow */
import SimpleSelector from './SimpleSelector';

import type NamespacePrefix from './NamespacePrefix';
import type Visitor from '../../traverser/visitor';

export default class UniversalSelector extends SimpleSelector {
  namespace: ?NamespacePrefix;

  constructor(namespace: ?NamespacePrefix) {
    super('UniversalSelector');
    this.namespace = namespace;
  }

  accept(visitor: Visitor): void {
    if (this.namespace) {
      visitor.visit(this.namespace);
    }
  }
}

