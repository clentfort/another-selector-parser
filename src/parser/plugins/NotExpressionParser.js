/* @flow */
import Plugin from './Plugin';
import { Node, SimpleSelector } from '../nodes';
import { UnexpectedTokenError } from '../util/Errors';

export class NotExpressionArgument extends Node {
  body: SimpleSelector;

  constructor(body: SimpleSelector) {
    super('NotExpressionArgument');
    this.body = body;
  }
}

export default class NotExpressionParser extends Plugin {
  // }

  // $FlowFixMe
  parse(): Array<NotExpressionArgument> {
    this._parser.pushContext({
      name: 'NotExpressionParser.parse',
      emitWhitespace: false,
    });

    const params = [];
    while (this._parser.getCurrentToken().type !== 'parenR') {
      const start = this._parser.getCurrentToken();
      params.push(this._parser.finishNode(new NotExpressionArgument(
        this._parser.parseSimpleSelector1()
      ), start));
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
}
