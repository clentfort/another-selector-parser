/* @flow */
import type { Token, TokenType } from '../tokenizer/tokens';

export class UnexpectedEofError extends Error {
  constructor() {
    super('Unexpected end of input.');
  }
}

export class UnexpectedTokenError extends Error {
  constructor(actual: Token, expected: TokenType|Array<TokenType>, value: ?any) {
    if (typeof expected === 'string') {
      let withValueOf = '';
      if (value) {
        withValueOf = ` with a value of "${value}"`;
      }
      super(`Unexpected token of type "${actual.type}", expected a token of type "${expected}"${withValueOf}.`);
    } else if (Array.isArray(expected)) {
      const allExpected = expected.join('", "');
      super(`Unexpected token of type "${actual.type}", expected one of "${allExpected}".`);
    } else {
      super(`Unexpected token of type "${actual.type}".`);
    }
  }
}
