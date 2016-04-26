/* @flow */
import Identifier from './Identifier';
import NamespacePrefix from './NamespacePrefix';
import Node from './Node';

export default class TypeSelector extends Node {
  namespace: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespace: ?NamespacePrefix) {
    super('TypeSelector');
    this.value = value;
    this.namespace = namespace;
  }
}
