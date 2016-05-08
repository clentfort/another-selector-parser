/* @flow */
import Node from './Node';

export default class NumberLiteral extends Node {
  value: number;

  constructor(value: number) {
    super('NumberLiteral');
    this.value = value;
  }
}
