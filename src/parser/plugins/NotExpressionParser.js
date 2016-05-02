/* @flow */
import { Node, SimpleSelector } from '../nodes';
import Plugin from './Plugin';

export class NotExpressionArgument extends Node {
  body: SimpleSelector;

  constructor(body: SimpleSelector) {
    super('NotExpressionArgument');
    this.body = body;
  }
}

export default class NotExpressionParser extends Plugin {

  // $FlowFixMe
  parse(): Array<NotExpressionArgument> {
    const params = [];
    while (this._parser.getCurrentToken().type !== 'parenR') {
      if (
        this._parser.getCurrentToken().type === 'EOF' ||
        this._parser.getCurrentToken().type === 'combinator' ||
        this._parser.getCurrentToken().type === 'plus'
      ) {
        // @TODO: Unexpected Token Error
        throw new Error();
      }
      if (
        this._parser.getCurrentToken().type !== 'comma' &&
        this._parser.getCurrentToken().type !== 'whitespace'
      ) {
        params.push(new NotExpressionArgument(
          this._parser.parseSimpleSelector1()
        ));
      }
      if (this._parser.getCurrentToken().type === 'parenR') {
        break;
      }
      this._parser.nextToken();
    }
    return params;
  }
}
