/* @flow */
import Node from './Node';

export default class SimpleSelector extends Node {
  constructor(type: string = 'SimpleSelector') {
    super(type);
  }
}
