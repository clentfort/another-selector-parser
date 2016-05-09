/* @flow */
import SimpleSelector from './SimpleSelector';

import type NamespacePrefix from './NamespacePrefix';
import type { DefaultTraverser } from '../../traverser';

export default class UniversalSelector extends SimpleSelector {
  namespacePrefix: ?NamespacePrefix;

  constructor(namespacePrefix: ?NamespacePrefix) {
    super('UniversalSelector');
    this.namespacePrefix = namespacePrefix;
  }

  accept(traverser: DefaultTraverser): void {
    if (this.namespacePrefix) {
      traverser.visit(this.namespacePrefix);
    }
  }
}

