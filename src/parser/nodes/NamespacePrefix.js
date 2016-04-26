/* @flow */
import Identifier from './Identifier';
import Node from './Node';

export default class NamespacePrefix extends Node {
  namespace: ?Identifier;

  constructor(namespace: ?Identifier) {
    super('NamespacePrefix');
    this.namespace = namespace;
  }
}
