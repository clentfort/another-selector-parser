/* @flow */
import type { DefaultTraverser } from '../../traverser';
import type { SourceLocation } from '../../util/location';

export default class Node {
  type: string;
  loc: ?SourceLocation;

  constructor(type: string) {
    this.type = type;
  }

  // We need to define traverser so flow is happy
  /* eslint-disable no-unused-vars */
  accept(traverser: DefaultTraverser): void {}
  /* eslint-enable no-unused-vars */
}
