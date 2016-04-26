/* @flow */
import Plugin from './Plugin';

import type { CallExpression } from '../nodes';
import type { Token } from '../../tokenizer/tokens';

export default class NthChildExpressionParser extends Plugin {
  // } {

  // @TODO: Implement nth-child(An+b [of S]?)
  // $FlowFixMe
  parseInto(callExpression: CallExpression): void {
    let depth = 1;
    let querystring = '';
    while (depth > 0) {
      if (this._parser.getCurrentToken().type === 'parenL') {
        ++depth;
      } else if (this._parser.getCurrentToken().type === 'parenR') {
        --depth;
      } else if (this._parser.getCurrentToken().type === 'EOF') {
        // @TODO: Unexpected EOF Error
        throw new Error();
      } else {
        querystring += tokenToString(this._parser.getCurrentToken());
      }
      this._parser.nextToken();
    }
    callExpression.params.push(querystring);
  }
}

function tokenToString(token: Token): string {
  switch (token.type) {
    case 'num':
      return token.value.toString();
    case 'ident':
      return token.value;
    case 'plus':
      return '+';
    default:
      // @TODO: Unexpected Token Error
      throw new Error();
  }
}
