/* @flow */
import Literal from './Literal';

export default class NumberLiteral extends Literal {
  value: number;

  constructor(value: number) {
    super('NumberLiteral');
    this.value = value;
  }
}
