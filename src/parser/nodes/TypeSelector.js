/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type NamespacePrefix from './NamespacePrefix';
import type Visitor from '../../traverser/visitor';

export default class TypeSelector extends SimpleSelector {
  namespace: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespace: ?NamespacePrefix) {
    super('TypeSelector');
    this.value = value;
    this.namespace = namespace;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.value);
    if (this.namespace) {
      visitor.visit(this.namespace);
    }
  }
}
