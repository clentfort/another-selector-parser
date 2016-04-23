/* @flow */
import NamespacePrefix from './NamespacePrefix';
import Node from './Node';

export default class UniversalSelector extends Node {
  namespace: ?NamespacePrefix;

  constructor(namespace: ?NamespacePrefix) {
    super('UniversalSelector');
    this.namespace = namespace;
  }
}

