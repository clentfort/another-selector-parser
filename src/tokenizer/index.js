/* @flow */
import codePointToString from './util/codePointToString';
import isDigit from './util/isDigit';
import isHexDigit from './util/isHexDigit';
import isNewLine from './util/isNewLine';
import isWhitespace from './util/isWhitespace';
import {
  EmptyHashTokenError,
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
  input: string;
  position: number;

  constructor(input: string, offset: number = 0) {
    this.input = input;
    this.position = offset;
  }

  *nextToken(): Generator<Token, void, void> {
    while (this.position < this.input.length) {
      // @TODO: Use something similar to [fullCharCodeAtPos]
      // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
      const charCode = this.input.charCodeAt(this.position);
      if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        yield this._getTokenFromCode(charCode);
      }
    }
    yield { type: tt.eof };
  }

  _consumeDigits(): number {
    const start = this.position;
    while (this.position < this.input.length) {
      if (isDigit(this.input.charCodeAt(this.position))) {
        ++this.position;
      } else {
        break;
      }
    }
    return this.position - start;
  }

  _getCharCodeOrThrowEof(): number {
    if (this.position >= this.input.length) {
      throw new UnexpectedEofError(this.position);
    }
    return this.input.charCodeAt(this.position);
  }

  _getTokenFromCode(charCode: number): Token {
    switch (charCode) {
      case 91: /* "[" */
        ++this.position; return { type: tt.bracketL };
      case 93: /* "]" */
        ++this.position; return { type: tt.bracketR };
      case 58: /* ":" */
        ++this.position; return { type: tt.colon };
      case 44: /* "," */
        ++this.position; return { type: tt.comma };
      case 40: /* "(" */
        ++this.position; return { type: tt.parenL };
      case 41: /* ")" */
        ++this.position; return { type: tt.parenR };
      case 37: /* "%" */
        ++this.position; return { type: tt.percentage };
      case 62: /* ">" */
        ++this.position; return { type: tt.combinator, value: '>' };
      case 61: /* "=" */
        ++this.position; return { type: tt.attrMatcher, value: '=' };
      case 42: /* "*" */
        return this._readTokenOrAttrMatcher({ type: tt.star });
      case 124: /* "|" */
        return this._readTokenOrAttrMatcher({ type: tt.pipe });
      case 36: /* "$" */
      case 94: /* "^" */
        return this._readAttrMatcher();
      case 126: /* "~" */
        return this._readTilde();
      case 35:
        return this._readHash();
      case 43: /* "+" */
      case 45: /* "-" */
      case 46: /* "." */
        return this._readPlusMinusDot(charCode);
      case 9: /* "\t" (Tab) */
      case 10: /* "\n" (Line break) */
      case 12: /* "\f" (Form feed) */
      case 13: /* "\r" (Carriage return) */
      case 32: /* " " (Space) */
        return this._readWhitespace();
      case 34: /* '"' */
      case 39: /* "'" */
        return this._readString(charCode);
      case 48: case 49: case 50: case 51: case 52: /* 0 - 4 */
      case 53: case 54: case 55: case 56: case 57: /* 5 - 9  */
        return this._readNumber();
      default:
        throw new UnexpectedCharacterError(
          codePointToString(charCode),
          this.position,
        );
    }
  }

  _readAttrMatcher(): Token {
    const type = this.input[this.position++];
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode === 61) { // "="
      ++this.position;
      return { type: tt.attrMatcher, value: `${type}=` };
    }
    throw new UnexpectedCharacterError(
      codePointToString(charCode),
      this.position,
      codePointToString(61), // '="
    );
  }

  _readHash(): Token {
    let value = '';
    let chunkStart = ++this.position;
    while (this.position < this.input.length) {
      const charCode = this.input.charCodeAt(this.position);
      /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
      if (
        (charCode === 45) /* "-" */ ||
        (charCode === 95) /* "_" */ ||
        (isDigit(charCode)) /* 0 - 9 */ ||
        (charCode >= 65 && charCode <= 90) /* A - Z */ ||
        (charCode >= 97 && charCode <= 122) /* a - z */ ||
        (charCode >= 0x00A0 && charCode <= 0x10FFFF)
      ) {
        ++this.position;
      } else if (charCode === 92) {
        value += this.input.slice(chunkStart, this.position);
        value += this._readEscapedChar();
        chunkStart = this.position;
      } else {
        break;
      }
    }
    value += this.input.slice(chunkStart, this.position++);
    if (value.length === 0) {
      throw new EmptyHashTokenError(this.position);
    }
    return { type: tt.hash, value };
  }

  _readNumber(): Token {
    const start = this.position;
    let isFloat = false;
    let charCode = this.input.charCodeAt(this.position);

    if (charCode === 43 || charCode === 45) { /* "+", "-" */
      ++this.position;
    }
    if (charCode === 46) { /* "." */
      ++this.position;
      isFloat = true;
    }

    this._consumeDigits();
    charCode = this.input.charCodeAt(this.position);

    if (charCode === 46) { /* "." */
      // If isFloat is true we already saw a "."
      if (isFloat) {
        throw new InvalidNumberError(start);
      }

      ++this.position;
      isFloat = true;
      this._consumeDigits();
      charCode = this.input.charCodeAt(this.position);
    }

    if (charCode === 69 || charCode === 101) { /* "E", "e" */
      charCode = this.input.charCodeAt(++this.position);
      if (charCode === 43 || charCode === 45) { /* "+", "-" */
        ++this.position;
      }
      if (this._consumeDigits() === 0) {
        throw new InvalidNumberError(start);
      }
      isFloat = true;
    }

    const value = this.input.slice(start, this.position);
    return {
      type: tt.num,
      value: isFloat ? parseFloat(value) : parseInt(value, 10),
    };
  }

  _readPlusMinusDot(charCode: number): Token {
    const nextCharCode = this.input.charCodeAt(this.position + 1);
    if (isDigit(nextCharCode) || nextCharCode === 46) { /* "." */
      return this._readNumber();
    }
    if (charCode === 45) { /* "-" */
      throw new UnexpectedCharacterError('-', this.position);
    }

    ++this.position;
    if (charCode === 43) {
      return {
        type: tt.plus,
      };
    }

    return {
      type: tt.dot,
    };
  }

  _readString(quote: number): Token {
    let value = '';
    let chunkStart = ++this.position;
    for (;;) {
      if (this.position >= this.input.length) {
        throw new UnterminatedStringError(this.position);
      }
      const charCode = this.input.charCodeAt(this.position);
      if (charCode === quote) {
        break;
      }
      if (charCode === 92) { // "\"
        value += this.input.slice(chunkStart, this.position);
        value += this._readEscapedChar();
        chunkStart = this.position;
      } else {
        if (isNewLine(charCode)) {
          throw new UnterminatedStringError(this.position);
        }
        ++this.position;
      }
    }
    value += this.input.slice(chunkStart, this.position++);
    return { type: tt.string, value };
  }

  _readEscapedChar(): string {
    const charCode = this.input.charCodeAt(++this.position);
    switch (charCode) {
      case 48: case 49: case 50: case 51: case 52: // 0 - 4
      case 53: case 54: case 55: case 56: case 57: // 5 - 9
      case 65: case 66: case 67: case 68: case 69: case 70: // A - F
      case 97: case 98: case 99: case 100: case 101: case 102: // a - f
        return codePointToString(this._readHexChar());
      case 110: ++this.position; return '\n';
      case 114: ++this.position; return '\r';
      case 116: ++this.position; return '\t';
      /**
       * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
       * If they do it, it must be right, right?
       */
      case 118: ++this.position; return '\u000b';
      default: ++this.position; return String.fromCharCode(charCode);
    }
  }

  _readHexChar(): number {
    const chunkStart = this.position;
    for (let i = 0; i < 6; ++i) {
      if (isHexDigit(this.input.charCodeAt(this.position))) {
        ++this.position;
      } else {
        break;
      }
    }

    const chunk = this.input.slice(chunkStart, this.position);
    // Consume a single whitespace or a "\r\n" if it directly follows the escape
    // sequence
    const charCode = this.input.charCodeAt(this.position);
    if (isWhitespace(charCode)) {
      ++this.position;
      // Consumed "\r", check if we can consume "\n"
      if (charCode === 13 && this.input.charCodeAt(this.position) === 10) {
        ++this.position;
      }
    }
    return parseInt(chunk, 16);
  }

  _readTilde(): Token {
    const next = this.input.charCodeAt(++this.position);
    if (next === 61) { // "="
      ++this.position;
      return { type: tt.attrMatcher, value: '~=' };
    }
    return { type: tt.combinator, value: '~' };
  }

  _readTokenOrAttrMatcher(token: Token): Token {
    const currentChar = this.input[this.position];
    const charCode = this.input.charCodeAt(++this.position);
    if (charCode === 61) { // "="
      ++this.position;
      return { type: tt.attrMatcher, value: `${currentChar}=` };
    }
    return token;
  }

  /**
   * Reads whitespace and returns a single token, any comment will be skipped
   */
  _readWhitespace(): Token {
    while (++this.position < this.input.length) {
      const charCode = this.input.charCodeAt(this.position);
      if (isWhitespace(charCode)) {
        ++this.position;
      } else if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        break;
      }
    }
    return { type: tt.whitespace };
  }

  _skipComment(): void {
    ++this.position;
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode !== 42) {
      throw new UnexpectedCharacterError(
        codePointToString(charCode),
        this.position,
        codePointToString(42), // "*"
      );
    }
    const end = this.input.indexOf('*/', this.position + 1);
    if (end === -1) {
      throw new UnterminatedCommentError(this.position);
    }
    this.position = end + 2;
  }
}

export default function tokenize(
  input: string,
): Generator<Token, void, void> {
  const tokenizer = new Tokenizer(input);
  return tokenizer.nextToken();
}
