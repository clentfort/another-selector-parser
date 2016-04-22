/* @flow */
import codePointToString from './util/codePointToString';
import isDigit from './util/isDigit';
import isHexDigit from './util/isHexDigit';
import isNewLine, { lineBreak } from './util/isNewLine';
import isLetter from './util/isLetter';
import isWhitespace from './util/isWhitespace';
import {
  InvalidNumberError,
  UnexpectedCharacterError,
  UnexpectedEofError,
  UnterminatedCommentError,
  UnterminatedStringError,
} from './Errors';

import type { Token, TokenType } from './tokens';
import type { Position } from '../util/location';

export class Tokenizer {
  _input: string;
  _currentLine: number;
  _currentLineStart: number;
  _currentPosition: number;
  _previousLine: number;
  _previousLineStart: number;
  _previousPosition: number;

  constructor(input: string) {
    this._input = input;
    this._previousLineStart = this._currentLineStart = 0;
    this._previousLine = this._currentLine = 1;
    this._previousPosition = this._currentPosition = 0;
  }

  *getTokens(): Generator<Token, Token, void> {
    while (this._currentPosition < this._input.length) {
      // @TODO: Use something similar to [fullCharCodeAtPos]
      // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
      const charCode = this._input.charCodeAt(this._currentPosition);
      if (charCode === 47) { /* "\" */
        this._skipComment();
        this._previousLine = this._currentLine;
        this._previousLineStart = this._currentLineStart;
        this._previousPosition = this._currentPosition;
      } else {
        yield this._getTokenFromCode(charCode);
      }
    }
    ++this._currentPosition;
    const eof = this._createToken('EOF');
    yield eof;
    return eof;
  }

  _createToken(type: TokenType, value:? any): Token {
    const start: Position = {
      column: this._previousPosition - this._previousLineStart,
      line: this._previousLine,
    };
    const end: Position = {
      column: this._currentPosition - this._currentLineStart,
      line: this._previousLine,
    };
    this._previousPosition = this._currentPosition;
    this._previousLine = this._currentLine;
    this._previousLineStart = this._currentLineStart;
    const token: any = { type, loc: { start, end } };
    if (value) {
      token.value = value;
    }
    return token;
  }

  _consumeDigits(): number {
    const chunkStart = this._currentPosition;
    while (this._currentPosition < this._input.length) {
      if (isDigit(this._input.charCodeAt(this._currentPosition))) {
        ++this._currentPosition;
      } else {
        break;
      }
    }
    return this._currentPosition - chunkStart;
  }

  _getCharCodeOrThrowEof(): number {
    if (this._currentPosition >= this._input.length) {
      throw new UnexpectedEofError(this._currentPosition);
    }
    return this._input.charCodeAt(this._currentPosition);
  }

  _getTokenFromCode(charCode: number): Token {
    switch (charCode) {
      case 91: /* "[" */
        ++this._currentPosition; return this._createToken('bracketL');
      case 93: /* "]" */
        ++this._currentPosition; return this._createToken('bracketR');
      case 58: /* ":" */
        ++this._currentPosition; return this._createToken('colon');
      case 44: /* "," */
        ++this._currentPosition; return this._createToken('comma');
      case 35: /* "#" */
        ++this._currentPosition; return this._createToken('hash');
      // case 45: /* "-" */
      //   ++this._currentPosition; return this._createToken('minus');
      case 40: /* "(" */
        ++this._currentPosition; return this._createToken('parenL');
      case 41: /* ")" */
        ++this._currentPosition; return this._createToken('parenR');
      case 37: /* "%" */
        ++this._currentPosition; return this._createToken('percentage');
      case 43: /* "+" */
        ++this._currentPosition; return this._createToken('plus');
      case 62: /* ">" */
        ++this._currentPosition; return this._createToken('combinator', '>');
      case 61: /* "=" */
        ++this._currentPosition; return this._createToken('matcher', '=');
      case 42: /* "*" */
        return this._readTokenOrAttrMatcher('star');
      case 124: /* "|" */
        return this._readTokenOrAttrMatcher('pipe');
      case 126: /* "~" */
        return this._readTilde();
      case 46: /* "." */
        return this._readDot();
      case 36: /* "$" */
      case 94: /* "^" */
        return this._readAttrMatcher();
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
        return isDigit(charCode) ? this._readNumber() : this._readIdentifier();
    }
  }

  _readAttrMatcher(): Token {
    const type = this._input[this._currentPosition++];
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode === 61) { // "="
      ++this._currentPosition;
      return this._createToken('matcher', `${type}=`);
    }
    throw new UnexpectedCharacterError(
      codePointToString(charCode),
      this._currentPosition,
      codePointToString(61), // '="
    );
  }

  _readDot(): Token {
    const nextCharCode = this._input.charCodeAt(this._currentPosition + 1);
    if (isDigit(nextCharCode)) {
      return this._readNumber();
    }
    ++this._currentPosition;
    return this._createToken('dot');
  }

  _readIdentifier(): Token {
    let value = '';
    let chunkStart = this._currentPosition;
    while (this._currentPosition < this._input.length) {
      const charCode = this._input.charCodeAt(this._currentPosition);
      /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
      if (
        (charCode === 45) /* "-" */ ||
        (charCode === 95) /* "_" */ ||
        (isDigit(charCode)) ||
        (isLetter(charCode)) ||
        (charCode >= 0x00A0 && charCode <= 0x10FFFF)
      ) {
        ++this._currentPosition;
      } else if (charCode === 92) {
        value += this._input.slice(chunkStart, this._currentPosition);
        value += this._readEscapedChar();
        chunkStart = this._currentPosition;
      } else {
        break;
      }
    }
    value += this._input.slice(chunkStart, this._currentPosition);
    if (value.length === 0) {
      throw new UnexpectedCharacterError(
        codePointToString(this._input.charCodeAt(this._currentPosition)),
        this._currentPosition,
      );
    }
    return this._createToken('ident', value);
  }

  _readNumber(): Token {
    const chunkStart = this._currentPosition;
    let isFloat = false;
    let charCode = this._input.charCodeAt(this._currentPosition);

    if (charCode === 46) { /* "." */
      ++this._currentPosition;
      isFloat = true;
    }

    this._consumeDigits();
    charCode = this._input.charCodeAt(this._currentPosition);

    if (charCode === 46) { /* "." */
      // If isFloat is true we already saw a "."
      if (isFloat) {
        throw new InvalidNumberError(chunkStart);
      }

      ++this._currentPosition;
      isFloat = true;
      this._consumeDigits();
      charCode = this._input.charCodeAt(this._currentPosition);
    }

    if (charCode === 69 || charCode === 101) { /* "E", "e" */
      charCode = this._input.charCodeAt(++this._currentPosition);
      if (charCode === 43 || charCode === 45) { /* "+", "-" */
        ++this._currentPosition;
      }
      if (this._consumeDigits() === 0) {
        throw new InvalidNumberError(chunkStart);
      }
      isFloat = true;
    }

    const value = this._input.slice(chunkStart, this._currentPosition);
    return this._createToken('num', isFloat ? parseFloat(value) : parseInt(value, 10));
  }

  _readString(quote: number): Token {
    let value = '';
    let chunkStart = ++this._currentPosition;
    for (;;) {
      if (this._currentPosition >= this._input.length) {
        throw new UnterminatedStringError(this._currentPosition);
      }
      const charCode = this._input.charCodeAt(this._currentPosition);
      if (charCode === quote) {
        break;
      }
      if (charCode === 92) { // "\"
        value += this._input.slice(chunkStart, this._currentPosition);
        value += this._readEscapedChar();
        chunkStart = this._currentPosition;
      } else {
        if (isNewLine(charCode)) {
          throw new UnterminatedStringError(this._currentPosition);
        }
        ++this._currentPosition;
      }
    }
    value += this._input.slice(chunkStart, this._currentPosition++);
    return this._createToken('string', value);
  }

  _readEscapedChar(): string {
    const charCode = this._input.charCodeAt(++this._currentPosition);
    switch (charCode) {
      case 110: ++this._currentPosition; return '\n';
      case 114: ++this._currentPosition; return '\r';
      case 116: ++this._currentPosition; return '\t';
      /**
       * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
       * If they do it, it must be right, right?
       */
      case 118: ++this._currentPosition; return '\u000b';
      case 10: case 12: case 13: /* "\n", "\f", "\r" */
        throw new UnexpectedCharacterError(
          codePointToString(charCode),
          this._currentPosition,
        );
      default:
        if (isHexDigit(charCode)) {
          return codePointToString(this._readHexChar());
        }

        ++this._currentPosition;
        return String.fromCharCode(charCode);
    }
  }

  _readHexChar(): number {
    const chunkStart = this._currentPosition;
    for (let i = 0; i < 6; ++i) {
      if (isHexDigit(this._input.charCodeAt(this._currentPosition))) {
        ++this._currentPosition;
      } else {
        break;
      }
    }

    const chunk = this._input.slice(chunkStart, this._currentPosition);
    // Consume a single whitespace or a "\r\n" if it directly follows the escape
    // sequence
    const charCode = this._input.charCodeAt(this._currentPosition);
    if (isWhitespace(charCode)) {
      ++this._currentPosition;
      // Consumed "\r", check if we can consume "\n"
      if (charCode === 13 && this._input.charCodeAt(this._currentPosition) === 10) {
        ++this._currentPosition;
      }
    }
    return parseInt(chunk, 16);
  }

  _readTilde(): Token {
    const next = this._input.charCodeAt(++this._currentPosition);
    if (next === 61) { // "="
      ++this._currentPosition;
      return this._createToken('matcher', '~=');
    }
    return this._createToken('combinator', '~');
  }

  _readTokenOrAttrMatcher(tokenType: TokenType): Token {
    const currentChar = this._input[this._currentPosition];
    const charCode = this._input.charCodeAt(++this._currentPosition);
    if (charCode === 61) { // "="
      ++this._currentPosition;
      return this._createToken('matcher', `${currentChar}=`);
    }
    return this._createToken(tokenType);
  }

  /**
   * Reads whitespace and returns a single token, any comment will be skipped
   */
  _readWhitespace(): Token {
    const start = this._currentPosition++;
    while (this._currentPosition < this._input.length) {
      const charCode = this._input.charCodeAt(this._currentPosition);
      if (isWhitespace(charCode)) {
        ++this._currentPosition;
      } else if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        break;
      }
    }

    lineBreak.lastIndex = start;
    let match;
    while (
      (match = lineBreak.exec(this._input)) &&
      (match.index < this._currentPosition)
    ) {
      ++this._currentLine;
      this._currentLineStart = match.index + match[0].length;
    }
    return this._createToken('whitespace');
  }

  _skipComment(): void {
    ++this._currentPosition;
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode !== 42) {
      throw new UnexpectedCharacterError(
        codePointToString(charCode),
        this._currentPosition,
        codePointToString(42), // "*"
      );
    }
    const start = this._currentPosition++;
    const end = this._input.indexOf('*/', this._currentPosition);
    if (end === -1) {
      throw new UnterminatedCommentError(this._currentPosition);
    }
    this._currentPosition = end + 2;

    lineBreak.lastIndex = start;
    let match;
    while (
      (match = lineBreak.exec(this._input)) &&
      (match.index < this._currentPosition)
    ) {
      ++this._currentLine;
      this._currentLineStart = match.index + match[0].length;
    }
  }
}

export default function tokenize(
  input: string,
): Generator<Token, Token, void> {
  const tokenizer = new Tokenizer(input);
  return tokenizer.getTokens();
}
