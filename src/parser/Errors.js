/* @flow */
import type { TokenType } from '../tokenizer/tokens';

export class UnexpectedTokenError extends Error {
  constructor(actual: TokenType, expected: ?TokenType) {
    if (expected) {
      super(`Unexpected token of type "${actual}", expected "${expected}".`);
    } else {
      super(`Unexpected token of type "${actual}".`);
    }
  }
}
