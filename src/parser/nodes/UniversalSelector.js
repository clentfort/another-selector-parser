/* @flow */
import NamespacePrefix from './NamespacePrefix';
import SimpleSelector from './SimpleSelector';

export default class UniversalSelector extends SimpleSelector {
  namespace: ?NamespacePrefix;

  constructor(namespace: ?NamespacePrefix) {
    super('UniversalSelector');
    this.namespace = namespace;
  }
}

