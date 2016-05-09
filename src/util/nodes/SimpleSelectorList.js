/* @flow */
import Node from './Node';

import type SimpleSelector from './SimpleSelector';
import type { DefaultTraverser } from '../../traverser';

export default class SimpleSelectorList extends Node {
  body: Array<SimpleSelector>;

  constructor(body: Array<SimpleSelector> = []) {
    super('SimpleSelectorList');
    this.body = body;
  }

  accept(traverser: DefaultTraverser): void {
    this.body.forEach(child => traverser.visit(child));
  }
}

