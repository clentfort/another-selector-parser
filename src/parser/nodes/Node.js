/* @flow */
import type { SourceLocation } from '../../util/location';

export default class Node {
  type: string;
  loc: ?SourceLocation;

  constructor(type: string) {
    this.type = type;
  }
}
