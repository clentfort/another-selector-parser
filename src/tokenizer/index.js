/* @flow */
import codePointToString from './util/codePointToString';
import isDigit from './util/isDigit';
import isHexDigit from './util/isHexDigit';
import isNewLine from './util/isNewLine';
import isWhitespace from './util/isWhitespace';
import {
  InvalidNumberError,
  UnexpectedCharacterError,
  UnexpectedEofError,
  UnterminatedCommentError,
  UnterminatedStringError,
} from './util/Errors';

import { types as tt } from './types';
import type { TokenType } from './types';

type Token = {
  type: TokenType;
  value?: any;
};

export class Tokenizer {
  _input: string;
  _position: number;

  constructor(input: string, offset: number = 0) {
    this._input = input;
    this._position = offset;
  }

  *nextToken(): Generator<Token, void, void> {
    while (this._position < this._input.length) {
      // @TODO: Use something similar to [fullCharCodeAtPos]
      // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
      const charCode = this._input.charCodeAt(this._position);
      if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        yield this._getTokenFromCode(charCode);
      }
    }
    yield { type: tt.eof };
  }

  _consumeDigits(): number {
    const chunkStart = this._position;
    while (this._position < this._input.length) {
      if (isDigit(this._input.charCodeAt(this._position))) {
        ++this._position;
      } else {
        break;
      }
    }
    return this._position - chunkStart;
  }

  _getCharCodeOrThrowEof(): number {
    if (this._position >= this._input.length) {
      throw new UnexpectedEofError(this._position);
    }
    return this._input.charCodeAt(this._position);
  }

  _getTokenFromCode(charCode: number): Token {
    switch (charCode) {
      case 91: /* "[" */
        ++this._position; return { type: tt.bracketL };
      case 93: /* "]" */
        ++this._position; return { type: tt.bracketR };
      case 58: /* ":" */
        ++this._position; return { type: tt.colon };
      case 44: /* "," */
        ++this._position; return { type: tt.comma };
      case 35: /* "#" */
        ++this._position; return { type: tt.hash };
      case 40: /* "(" */
        ++this._position; return { type: tt.parenL };
      case 41: /* ")" */
        ++this._position; return { type: tt.parenR };
      case 37: /* "%" */
        ++this._position; return { type: tt.percentage };
      case 62: /* ">" */
        ++this._position; return { type: tt.combinator, value: '>' };
      case 61: /* "=" */
        ++this._position; return { type: tt.attrMatcher, value: '=' };
      case 42: /* "*" */
        return this._readTokenOrAttrMatcher({ type: tt.star });
      case 124: /* "|" */
        return this._readTokenOrAttrMatcher({ type: tt.pipe });
      case 126: /* "~" */
        return this._readTilde();
      case 46: /* "." */
        return this._readDot();
      case 36: /* "$" */
      case 94: /* "^" */
        return this._readAttrMatcher();
      case 43: /* "+" */
      case 45: /* "-" */
        return this._readPlusMinus(charCode);
      case 34: /* '"' */
      case 39: /* "'" */
        return this._readString(charCode);
      case 9: /* "\t" (Tab) */
      case 10: /* "\n" (Line break) */
      case 12: /* "\f" (Form feed) */
      case 13: /* "\r" (Carriage return) */
      case 32: /* " " (Space) */
        return this._readWhitespace();
      case 48: case 49: case 50: case 51: case 52: /* 0 - 4 */
      case 53: case 54: case 55: case 56: case 57: /* 5 - 9  */
        return this._readNumber();
      default:
        return this._readIdentifier();
    }
  }

  _readAttrMatcher(): Token {
    const type = this._input[this._position++];
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode === 61) { // "="
      ++this._position;
      return { type: tt.attrMatcher, value: `${type}=` };
    }
    throw new UnexpectedCharacterError(
      codePointToString(charCode),
      this._position,
      codePointToString(61), // '="
    );
  }

  _readDot(): Token {
    const nextCharCode = this._input.charCodeAt(this._position + 1);
    if (isDigit(nextCharCode)) {
      return this._readNumber();
    }
    ++this._position;
    return {
      type: tt.dot,
    };
  }

  _readIdentifier(): Token {
    let value = '';
    let chunkStart = this._position;
    while (this._position < this._input.length) {
      const charCode = this._input.charCodeAt(this._position);
      /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
      if (
        (charCode === 45) /* "-" */ ||
        (charCode === 95) /* "_" */ ||
        (isDigit(charCode)) /* 0 - 9 */ ||
        (charCode >= 65 && charCode <= 90) /* A - Z */ ||
        (charCode >= 97 && charCode <= 122) /* a - z */ ||
        (charCode >= 0x00A0 && charCode <= 0x10FFFF)
      ) {
        ++this._position;
      } else if (charCode === 92) {
        value += this._input.slice(chunkStart, this._position);
        value += this._readEscapedChar();
        chunkStart = this._position;
      } else {
        break;
      }
    }
    value += this._input.slice(chunkStart, this._position);
    if (value.length === 0) {
      throw new UnexpectedCharacterError(
        codePointToString(this._input.charCodeAt(this._position)),
        this._position,
      );
    }
    ++this._position;
    return { type: tt.ident, value };
  }

  _readNumber(): Token {
    const chunkStart = this._position;
    let isFloat = false;
    let charCode = this._input.charCodeAt(this._position);

    if (charCode === 43 || charCode === 45) { /* "+", "-" */
      ++this._position;
    }
    if (charCode === 46) { /* "." */
      ++this._position;
      isFloat = true;
    }

    this._consumeDigits();
    charCode = this._input.charCodeAt(this._position);

    if (charCode === 46) { /* "." */
      // If isFloat is true we already saw a "."
      if (isFloat) {
        throw new InvalidNumberError(chunkStart);
      }

      ++this._position;
      isFloat = true;
      this._consumeDigits();
      charCode = this._input.charCodeAt(this._position);
    }

    if (charCode === 69 || charCode === 101) { /* "E", "e" */
      charCode = this._input.charCodeAt(++this._position);
      if (charCode === 43 || charCode === 45) { /* "+", "-" */
        ++this._position;
      }
      if (this._consumeDigits() === 0) {
        throw new InvalidNumberError(chunkStart);
      }
      isFloat = true;
    }

    const value = this._input.slice(chunkStart, this._position);
    return {
      type: tt.num,
      value: isFloat ? parseFloat(value) : parseInt(value, 10),
    };
  }

  _readPlusMinus(charCode: number): Token {
    const nextCharCode = this._input.charCodeAt(this._position + 1);
    if (isDigit(nextCharCode) || nextCharCode === 46) { /* "." */
      return this._readNumber();
    }
    if (charCode === 45) { /* "-" */
      throw new UnexpectedCharacterError('-', this._position);
    }

    ++this._position;
    return {
      type: tt.plus,
    };
  }

  _readString(quote: number): Token {
    let value = '';
    let chunkStart = ++this._position;
    for (;;) {
      if (this._position >= this._input.length) {
        throw new UnterminatedStringError(this._position);
      }
      const charCode = this._input.charCodeAt(this._position);
      if (charCode === quote) {
        break;
      }
      if (charCode === 92) { // "\"
        value += this._input.slice(chunkStart, this._position);
        value += this._readEscapedChar();
        chunkStart = this._position;
      } else {
        if (isNewLine(charCode)) {
          throw new UnterminatedStringError(this._position);
        }
        ++this._position;
      }
    }
    value += this._input.slice(chunkStart, this._position++);
    return { type: tt.string, value };
  }

  _readEscapedChar(): string {
    const charCode = this._input.charCodeAt(++this._position);
    switch (charCode) {
      case 48: case 49: case 50: case 51: case 52: // 0 - 4
      case 53: case 54: case 55: case 56: case 57: // 5 - 9
      case 65: case 66: case 67: case 68: case 69: case 70: // A - F
      case 97: case 98: case 99: case 100: case 101: case 102: // a - f
        return codePointToString(this._readHexChar());
      case 110: ++this._position; return '\n';
      case 114: ++this._position; return '\r';
      case 116: ++this._position; return '\t';
      /**
       * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
       * If they do it, it must be right, right?
       */
      case 118: ++this._position; return '\u000b';
      case 10: case 12: case 13: /* "\n", "\f", "\r" */
        throw new UnexpectedCharacterError(
          codePointToString(charCode),
          this._position,
        );
      default: ++this._position; return String.fromCharCode(charCode);
    }
  }

  _readHexChar(): number {
    const chunkStart = this._position;
    for (let i = 0; i < 6; ++i) {
      if (isHexDigit(this._input.charCodeAt(this._position))) {
        ++this._position;
      } else {
        break;
      }
    }

    const chunk = this._input.slice(chunkStart, this._position);
    // Consume a single whitespace or a "\r\n" if it directly follows the escape
    // sequence
    const charCode = this._input.charCodeAt(this._position);
    if (isWhitespace(charCode)) {
      ++this._position;
      // Consumed "\r", check if we can consume "\n"
      if (charCode === 13 && this._input.charCodeAt(this._position) === 10) {
        ++this._position;
      }
    }
    return parseInt(chunk, 16);
  }

  _readTilde(): Token {
    const next = this._input.charCodeAt(++this._position);
    if (next === 61) { // "="
      ++this._position;
      return { type: tt.attrMatcher, value: '~=' };
    }
    return { type: tt.combinator, value: '~' };
  }

  _readTokenOrAttrMatcher(token: Token): Token {
    const currentChar = this._input[this._position];
    const charCode = this._input.charCodeAt(++this._position);
    if (charCode === 61) { // "="
      ++this._position;
      return { type: tt.attrMatcher, value: `${currentChar}=` };
    }
    return token;
  }

  /**
   * Reads whitespace and returns a single token, any comment will be skipped
   */
  _readWhitespace(): Token {
    while (++this._position < this._input.length) {
      const charCode = this._input.charCodeAt(this._position);
      if (isWhitespace(charCode)) {
        ++this._position;
      } else if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        break;
      }
    }
    return { type: tt.whitespace };
  }

  _skipComment(): void {
    ++this._position;
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode !== 42) {
      throw new UnexpectedCharacterError(
        codePointToString(charCode),
        this._position,
        codePointToString(42), // "*"
      );
    }
    const end = this._input.indexOf('*/', this._position + 1);
    if (end === -1) {
      throw new UnterminatedCommentError(this._position);
    }
    this._position = end + 2;
  }
}

export default function tokenize(
  input: string,
): Generator<Token, void, void> {
  const tokenizer = new Tokenizer(input);
  return tokenizer.nextToken();
}
