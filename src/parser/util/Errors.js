/* @flow */
import AnotherSelectorParserError from '../../util/Error';

import type { Token, TokenType } from '../../tokenizer/tokens';

export class UnexpectedEofError extends AnotherSelectorParserError {
  constructor(actual: Token) {
    let end = '.';
    if (actual.loc) {
      const { line, column } = actual.loc.start;
      end = ` on line ${line}, column ${column}.`;
    }
    super(`Unexpected end of input${end}`);
  }
}

export class UnexpectedTokenError extends AnotherSelectorParserError {
  constructor(
    actual: Token,
    expected: ?TokenType|Array<TokenType>,
    value: ?any
  ) {
    const start = `Unexpected token of type "${actual.type}"`;
    let end = '.';
    if (actual.loc) {
      const { line, column } = actual.loc.start;
      end = ` on line ${line}, column ${column}.`;
    }
    if (typeof expected === 'string') {
      let withValueOf = '';
      if (value) {
        withValueOf = ` with a value of "${value}"`;
      }
      super(`${start}, expected "${expected}"${withValueOf}${end}`);
    } else if (Array.isArray(expected)) {
      const allExpected = expected.join('", "');
      super(`${start}, expected one of "${allExpected}"${end}`);
    } else {
      super(`${start}${end}`);
    }
  }
}

export class UnfinishedSelectorError extends AnotherSelectorParserError {
  constructor() {
    super('Unfinished selector');
  }
}

export class InvalidContextError extends AnotherSelectorParserError {
  constructor(name: string, current: string) {
    super(`Trying to pop context with name "${name}", but the current context is "${current}"`);
  }
}
