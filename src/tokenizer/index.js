/* @flow */
import codePointToString from './util/codePointToString';
import isDigit from './util/isDigit';
import isHexDigit from './util/isHexDigit';
import isNewLine from './util/isNewLine';
import isLetter from './util/isLetter';
import isWhitespace from './util/isWhitespace';
import {
  InvalidNumberError,
  UnexpectedCharacterError,
  UnexpectedEofError,
  UnterminatedCommentError,
  UnterminatedStringError,
} from './Errors';

import { types as tt } from './types';
import type { TokenType } from './types';

export type Token = {
  type: TokenType;
  start: number;
  end: number;
  value?: any;
};

export class Tokenizer {
  _input: string;
  _position: number;
  _lastPosition: number;

  constructor(input: string, offset: number = 0) {
    this._input = input;
    this._lastPosition = this._position = offset;
  }

  *getTokens(): Generator<Token, Token, void> {
    while (this._position < this._input.length) {
      // @TODO: Use something similar to [fullCharCodeAtPos]
      // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
      const charCode = this._input.charCodeAt(this._position);
      if (charCode === 47) { /* "\" */
        this._skipComment();
        this._lastPosition = this._position;
      } else {
        yield this._getTokenFromCode(charCode);
      }
    }
    ++this._position;
    const eof = this._createToken(tt.eof);
    yield eof;
    return eof;
  }

  _createToken(type: TokenType, value:? any): Token {
    const start = this._lastPosition;
    const end = this._position;
    this._lastPosition = this._position;
    const token: Token = { type, start, end };
    if (value) {
      token.value = value;
    }
    return token;
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
        ++this._position; return this._createToken(tt.bracketL);
      case 93: /* "]" */
        ++this._position; return this._createToken(tt.bracketR);
      case 58: /* ":" */
        ++this._position; return this._createToken(tt.colon);
      case 44: /* "," */
        ++this._position; return this._createToken(tt.comma);
      case 35: /* "#" */
        ++this._position; return this._createToken(tt.hash);
      case 40: /* "(" */
        ++this._position; return this._createToken(tt.parenL);
      case 41: /* ")" */
        ++this._position; return this._createToken(tt.parenR);
      case 37: /* "%" */
        ++this._position; return this._createToken(tt.percentage);
      case 62: /* ">" */
        ++this._position; return this._createToken(tt.combinator, '>');
      case 61: /* "=" */
        ++this._position; return this._createToken(tt.attrMatcher, '=');
      case 42: /* "*" */
        return this._readTokenOrAttrMatcher(tt.star);
      case 124: /* "|" */
        return this._readTokenOrAttrMatcher(tt.pipe);
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
      default:
        if (isDigit(charCode)) {
          return this._readNumber();
        }
        return this._readIdentifier();
    }
  }

  _readAttrMatcher(): Token {
    const type = this._input[this._position++];
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode === 61) { // "="
      ++this._position;
      return this._createToken(tt.attrMatcher, `${type}=`);
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
    return this._createToken(tt.dot);
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
        (isDigit(charCode)) ||
        (isLetter(charCode)) ||
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
    return this._createToken(tt.ident, value);
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
    return this._createToken(tt.num, isFloat ? parseFloat(value) : parseInt(value, 10));
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
    return this._createToken(tt.plus);
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
    return this._createToken(tt.string, value);
  }

  _readEscapedChar(): string {
    const charCode = this._input.charCodeAt(++this._position);
    switch (charCode) {
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
      default:
        if (isHexDigit(charCode)) {
          return codePointToString(this._readHexChar());
        }

        ++this._position;
        return String.fromCharCode(charCode);
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
      return this._createToken(tt.attrMatcher, '~=');
    }
    return this._createToken(tt.combinator, '~');
  }

  _readTokenOrAttrMatcher(tokenType: TokenType): Token {
    const currentChar = this._input[this._position];
    const charCode = this._input.charCodeAt(++this._position);
    if (charCode === 61) { // "="
      ++this._position;
      return this._createToken(tt.attrMatcher, `${currentChar}=`);
    }
    return this._createToken(tokenType);
  }

  /**
   * Reads whitespace and returns a single token, any comment will be skipped
   */
  _readWhitespace(): Token {
    ++this._position;
    while (this._position < this._input.length) {
      const charCode = this._input.charCodeAt(this._position);
      if (isWhitespace(charCode)) {
        ++this._position;
      } else if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        break;
      }
    }
    return this._createToken(tt.whitespace);
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
): Generator<Token, Token, void> {
  const tokenizer = new Tokenizer(input);
  return tokenizer.getTokens();
}
