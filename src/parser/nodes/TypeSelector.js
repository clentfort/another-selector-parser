/* @flow */
import Identifier from './Identifier';
import NamespacePrefix from './NamespacePrefix';
import SimpleSelector from './SimpleSelector';

export default class TypeSelector extends SimpleSelector {
  namespace: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespace: ?NamespacePrefix) {
    super('TypeSelector');
    this.value = value;
    this.namespace = namespace;
  }
}
