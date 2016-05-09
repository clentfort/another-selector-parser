/* @flow */
import type { DefaultParser } from '../parser';
import type { Node, NodeType } from '../util/nodes';

export default class Plugin {
  _parser: DefaultParser;

  constructor(parser: DefaultParser) {
    this._parser = parser;
  }

  parse(): Array<Node> {
    throw new Error(
      'You called `parse` on the Plugin-Prototype, not on an actual Plugin'
    );
  }

  static getNewAstNodes(): Array<any> {
    throw new Error(
      'You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin'
    );
  }

  static getTargetNode(): NodeType {
    throw new Error(
      'You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin'
    );
  }

  static getTargetExpression(): string {
    throw new Error(
      'You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin'
    );
  }
}
