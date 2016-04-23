/* @flow */
import Node from './Node';

export default class Identifier extends Node {
  value: string;

  constructor(value: string) {
    super('Identifier');
    this.value = value;
  }
}
