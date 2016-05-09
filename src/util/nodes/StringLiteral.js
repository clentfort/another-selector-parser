/* @flow */
import Literal from './Literal';

export default class StringLiteral extends Literal {
  value: string;

  constructor(value: string) {
    super('StringLiteral');
    this.value = value;
  }
}
