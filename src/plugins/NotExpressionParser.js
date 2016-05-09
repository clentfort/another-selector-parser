/* @flow */
import Plugin from './Plugin';
import { UnexpectedTokenError } from '../parser/util/Errors';
import { Node, SimpleSelector } from '../util/nodes';

import type { DefaultTraverser } from '../traverser';
import type { NodeType } from '../util/nodes';

export class NotExpressionArgument extends Node {
  value: SimpleSelector;

  constructor(value: SimpleSelector) {
    super('NotExpressionArgument');
    this.value = value;
  }

  accept(traverser: DefaultTraverser) {
    traverser.visit(this.value);
  }
}

export default class NotExpressionParser extends Plugin {
  // $FlowIssue
  parse(): Array<NotExpressionArgument> {
    this._parser.pushContext({
      name: 'NotExpressionParser.parse',
      emitWhitespace: false,
    });

    const params = [];
    while (this._parser.getCurrentToken().type !== 'parenR') {
      const start = this._parser.getCurrentToken();
      const simpleSelector = this._parser.parseSimpleSelector1();
      params.push(this._parser.finishNode(
        new NotExpressionArgument(simpleSelector),
        simpleSelector,
        start,
      ));
      if (this._parser.getCurrentToken().type === 'comma') {
        this._parser.nextToken();
      } else if (this._parser.getCurrentToken().type !== 'parenR') {
        throw new UnexpectedTokenError(
          this._parser.getCurrentToken(),
          ['comma', 'parenR']
        );
      }
    }
    this._parser.nextToken();

    this._parser.popContext('NotExpressionParser.parse');
    return params;
  }

  static getTargetNode(): NodeType {
    return 'CallExpression';
  }

  static getTargetExpression(): string {
    return 'not';
  }

  static getNewAstNodes(): Array<any> {
    return [
      NotExpressionArgument,
    ];
  }
}
