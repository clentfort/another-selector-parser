/* @flow */
/* eslint-disable no-unused-vars */
import type Parser from '../';
import type { Node } from '../nodes';

export default class Plugin {
  _parser: Parser;

  constructor(parser: Parser) {
    this._parser = parser;
  }

  parseInto(node: Node): void {
    throw new Error(
      'You called `parse` on the Plugin-Prototype, not on an actual Plugin'
    );
  }
}
