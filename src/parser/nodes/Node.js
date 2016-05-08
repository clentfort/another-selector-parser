/* @flow */
import type Visitor from '../../traverser/visitor';
import type { SourceLocation } from '../../util/location';

export default class Node {
  type: string;
  loc: ?SourceLocation;

  constructor(type: string) {
    this.type = type;
  }

  // We need to define visitor so flow is happy
  /* eslint-disable no-unused-vars */
  accept(visitor: Visitor): void {}
  /* eslint-enable no-unused-vars */

  clone<T: Node>(): T {
    // $FlowFixMe
    const node = (new this.constructor: any);
    /* eslint-disable guard-for-in */
    for (const key in this) {
      const value = (this: any)[key];
      node[key] = value;
    }
    /* eslint-enable guard-for-in */
    return node;
  }
}
