/* @flow */
import Node from './Node';

// @TODO: Generalize with tokenizer
export type CombinatorOperatorValue = '+' | '~' | '>' | 'whitespace';

export default class Combinator extends Node {
  operator: CombinatorOperator;

  constructor(operator: CombinatorOperator) {
    super('Combinator');
    this.operator = operator;
  }
}

export class CombinatorOperator extends Node {
  value: CombinatorOperatorValue;

  constructor(value: CombinatorOperatorValue) {
    super('CombinatorOperator');
    this.value = value;
  }
}
