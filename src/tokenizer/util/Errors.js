/* @flow */
import AnotherSelectorParserError from '../../util/Error';
export class InvalidNumberError extends AnotherSelectorParserError {
  constructor(position: number) {
    super(`Invalid number starting at position ${position}.`);
  }
}

export class UnexpectedCharacterError extends AnotherSelectorParserError {
  constructor(actual: string, position: number, expected: ?string) {
    if (!!expected) {
      super(`Unexpected char "${actual}" at position ${position}, expected "${expected}".`);
    } else {
      super(`Unexpected char "${actual}" at position ${position}.`);
    }
  }
}

export class UnexpectedEofError extends AnotherSelectorParserError {
  constructor(position: number, expected: ?string) {
    if (!!expected) {
      super(`Unexpected end of input at position ${position}, expected "${expected}".`);
    } else {
      super(`Unexpected end of input at position ${position}.`);
    }
  }
}

export class UnterminatedCommentError extends AnotherSelectorParserError {
  constructor(position: number) {
    super(`Unterminated comment at position ${position}.`);
  }
}

export class UnterminatedStringError extends AnotherSelectorParserError {
  constructor(position: number) {
    super(`Unterminated string constant at position ${position}.`);
  }
}
