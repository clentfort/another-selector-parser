/* @flow */
import Node from './Node';

export default class StringLiteral extends Node {
  value: string;

  constructor(value: string) {
    super('StringLiteral');
    this.value = value;
  }
}
