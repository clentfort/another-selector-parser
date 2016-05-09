/* @flow */
import Node from './Node';

import type Selector from './Selector';
import type { DefaultTraverser } from '../../traverser';

export default class SelectorList extends Node {
  body: Array<Selector>;

  constructor(body: Array<Selector> = []) {
    super('SelectorList');
    this.body = body;
  }

  accept(traverser: DefaultTraverser): void {
    this.body.forEach(child => traverser.visit(child));
  }
}
