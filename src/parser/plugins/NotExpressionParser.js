/* @flow */
import Plugin from './Plugin';

import type Parser from '../';
import type { CallExpression } from '../nodes';

export default class NotExpressionParser extends Plugin {
  _inNotExpression: boolean;
  // } {

  constructor(parser: Parser) {
    super(parser);
    this._inNotExpression = false;
  }

  // $FlowFixMe
  parseInto(callExpression: CallExpression): void {
    if (this._inNotExpression) {
      throw new Error('Trying to parse nested not-expressions');
    }
    this._inNotExpression = true;

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
        callExpression.params.push(this._parser.parseSimpleSelector1());
      }
      if (this._parser.getCurrentToken().type === 'parenR') {
        break;
      }
      this._parser.nextToken();
    }
    this._inNotExpression = false;
  }
}
