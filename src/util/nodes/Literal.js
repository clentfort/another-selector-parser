/* @flow */
import Node from './Node';

export default class Literal extends Node {
  constructor(type: string = 'Literal') {
    super(type);
  }
}
