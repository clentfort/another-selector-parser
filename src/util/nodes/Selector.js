/* @flow */
import Node from './Node';

import type Combinator from './Combinator';
import type SimpleSelectorList from './SimpleSelectorList';
import type { DefaultTraverser } from '../../traverser';

export default class Selector extends Node {
  body: Array<SimpleSelectorList | Combinator>;

  constructor(body: Array<SimpleSelectorList | Combinator> = []) {
    super('Selector');
    this.body = body;
  }

  accept(traverser: DefaultTraverser): void {
    this.body.forEach(child => traverser.visit(child));
  }
}
