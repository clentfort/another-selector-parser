/* @flow */
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type NamespacePrefix from './NamespacePrefix';
import type { DefaultTraverser } from '../../traverser';

export default class TypeSelector extends SimpleSelector {
  namespacePrefix: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespacePrefix: ?NamespacePrefix) {
    super('TypeSelector');
    this.value = value;
    this.namespacePrefix = namespacePrefix;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
    if (this.namespacePrefix) {
      traverser.visit(this.namespacePrefix);
    }
  }
}
