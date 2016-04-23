/* @flow */
import Node from './Node';
import Selector from './Selector';

export default class SelectorsGroup extends Node {
  body: Array<Selector>;

  constructor() {
    super('SelectorsGroup');
    this.body = [];
  }
}
