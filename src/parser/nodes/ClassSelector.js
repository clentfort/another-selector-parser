/* @flow */
import Identifier from './Identifier';
import Node from './Node';

export default class ClassSelector extends Node {
  value: Identifier;

  constructor(value: Identifier) {
    super('ClassSelector');
    this.value = value;
  }
}
