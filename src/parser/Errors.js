/* @flow */
import type { TokenType } from '../tokenizer/types';
import type { NodeType } from './index';

export class UnexpectedTopNodeError extends Error {
  constructor(actual: NodeType, expected: ?NodeType) {
    if (expected) {
      super(`Unexpected node of type "${actual}" at the top of the stack, expected a node of type ${expected}.`);
    } else {
      super(`Unexpected node of type "${actual}" at the top of the stack.`);
    }
  }
}

export class UnexpectedTokenError extends Error {
  constructor(actual: TokenType, expected: ?TokenType) {
    if (expected) {
      super(`Unexpected token of type "${actual.label}", expected "${expected.label}".`);
    } else {
      super(`Unexpected token of type "${actual.label}".`);
    }
  }
}
