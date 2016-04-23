/* @flow */
import Identifier from './Identifier';
import Node from './Node';

export default class HashSelector extends Node {
  value: Identifier;

  constructor(value: Identifier) {
    super('HashSelector');
    this.value = value;
  }
}

