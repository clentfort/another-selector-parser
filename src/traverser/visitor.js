/* @flow */
import type { Node as NNode } from '../parser/nodes';

export default class Visitor {
  visit(node: NNode): void {
    node.accept(this);
  }
}
