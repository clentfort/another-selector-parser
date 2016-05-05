/* @flow */
import Node from './Node';

export type CombinatorType =
  'child' |
  'descendant' |
  'sibling-following' |
  'sibling-next';

export default class Combinator extends Node {
  combinatorType: CombinatorType;

  constructor(combinatorType: CombinatorType) {
    super('Combinator');
    this.combinatorType = combinatorType;
  }
}
