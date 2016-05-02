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
import { Position, SourceLocation } from '../util/location';

class State {
  currentLine: number;
  currentLineStart: number;
  currentPosition: number;
  input: string;
  previousLine: number;
  previousLineStart: number;
  previousPosition: number;
  emitWhitespace: boolean;

  constructor(input: string) {
    this.input = input;
    this.previousLine = this.currentLine = 1;
    this.previousLineStart = this.currentLineStart = 0;
    this.previousPosition = this.currentPosition = 0;
    this.emitWhitespace = true;
  }

  clone(): State {
    // $FlowFixMe
    const state = (new State: any);
    /* eslint-disable guard-for-in */
    for (const key in this) {
      const value = (this: any)[key];
      state[key] = value;
    }
    /* eslint-enable guard-for-in */
    return state;
  }
}

export default class Tokenizer {
  _state: State;
  _originalState: ?State;

  constructor(input: string) {
    this._state = new State(input);
  }

  peek(): void {
    if (!!this._originalState) {
      // Already peeking
      throw new Error();
    }
    this._originalState = this._state;
    this._state = this._state.clone();
  }

  skip(): void {
    this._originalState = null;
  }

  backup(): void {
    if (!this._originalState) {
      // Not peeking
      throw new Error();
    }
    this._state = this._originalState;
    this._originalState = null;
  }

  emitWhitespace(emitWhitespace: boolean): void {
    this._state.emitWhitespace = emitWhitespace;
  }

  nextToken(): Token {
    while (this._state.currentPosition < this._state.input.length) {
      // @TODO: Use something similar to [fullCharCodeAtPos]
      // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
      const charCode = this._state.input.charCodeAt(this._state.currentPosition);
      if (charCode === 47) { /* "\" */
        this._skipComment();
        this._state.previousLine = this._state.currentLine;
        this._state.previousLineStart = this._state.currentLineStart;
        this._state.previousPosition = this._state.currentPosition;
      } else {
        const token = this._getTokenFromCode(charCode);
        if (!this._state.emitWhitespace && token.type === 'whitespace') {
          continue;
        }
        return token;
      }
    }
    if (this._state.currentPosition === this._state.input.length) {
      ++this._state.currentPosition;
    }
    return this._createToken('EOF');
  }

  _createToken(type: TokenType, value:? any): Token {
    const start = new Position(
      this._state.previousLine,
      this._state.previousPosition - this._state.previousLineStart,
    );
    const end = new Position(
      this._state.previousLine,
      this._state.currentPosition - this._state.currentLineStart,
    );

    this._state.previousPosition = this._state.currentPosition;
    this._state.previousLine = this._state.currentLine;
    this._state.previousLineStart = this._state.currentLineStart;
    const token: any = { type, loc: new SourceLocation(start, end) };
    if (value) {
      token.value = value;
    }
    return token;
  }

  _consumeDigits(): number {
    const chunkStart = this._state.currentPosition;
    while (this._state.currentPosition < this._state.input.length) {
      if (isDigit(this._state.input.charCodeAt(this._state.currentPosition))) {
        ++this._state.currentPosition;
      } else {
        break;
      }
    }
    return this._state.currentPosition - chunkStart;
  }

  _getCharCodeOrThrowEof(): number {
    if (this._state.currentPosition >= this._state.input.length) {
      throw new UnexpectedEofError(this._state.currentPosition);
    }
    return this._state.input.charCodeAt(this._state.currentPosition);
  }

  _getTokenFromCode(charCode: number): Token {
    switch (charCode) {
      case 91: /* "[" */
        ++this._state.currentPosition; return this._createToken('bracketL');
      case 93: /* "]" */
        ++this._state.currentPosition; return this._createToken('bracketR');
      case 58: /* ":" */
        ++this._state.currentPosition; return this._createToken('colon');
      case 44: /* "," */
        ++this._state.currentPosition; return this._createToken('comma');
      case 35: /* "#" */
        ++this._state.currentPosition; return this._createToken('hash');
      case 40: /* "(" */
        ++this._state.currentPosition; return this._createToken('parenL');
      case 41: /* ")" */
        ++this._state.currentPosition; return this._createToken('parenR');
      case 37: /* "%" */
        ++this._state.currentPosition; return this._createToken('percentage');
      case 43: /* "+" */
        ++this._state.currentPosition; return this._createToken('plus');
      case 62: /* ">" */
        ++this._state.currentPosition; return this._createToken('combinator', '>');
      case 61: /* "=" */
        ++this._state.currentPosition; return this._createToken('matcher', '=');
      case 42: /* "*" */
        return this._readTokenOrAttrMatcher('star');
      case 124: /* "|" */
        return this._readTokenOrAttrMatcher('pipe');
      case 126: /* "~" */
        return this._readTilde();
      case 46: /* "." */
        return this._readDot();
      case 45: /* "-" */
        return this._readMinus();
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
    const type = this._state.input[this._state.currentPosition++];
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode === 61) { // "="
      ++this._state.currentPosition;
      return this._createToken('matcher', `${type}=`);
    }
    throw new UnexpectedCharacterError(
      codePointToString(charCode),
      this._state.currentPosition,
      codePointToString(61), // '="
    );
  }

  _readDot(): Token {
    const nextCharCode = this._state.input.charCodeAt(this._state.currentPosition + 1);
    if (isDigit(nextCharCode)) {
      return this._readNumber();
    }
    ++this._state.currentPosition;
    return this._createToken('dot');
  }

  _readIdentifier(): Token {
    let value = '';
    let chunkStart = this._state.currentPosition;
    while (this._state.currentPosition < this._state.input.length) {
      const charCode = this._state.input.charCodeAt(this._state.currentPosition);
      /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
      if (
        (charCode === 45) /* "-" */ ||
        (charCode === 95) /* "_" */ ||
        (isDigit(charCode)) ||
        (isLetter(charCode)) ||
        (charCode >= 0x00A0 && charCode <= 0x10FFFF)
      ) {
        ++this._state.currentPosition;
      } else if (charCode === 92) {
        value += this._state.input.slice(chunkStart, this._state.currentPosition);
        value += this._readEscapedChar();
        chunkStart = this._state.currentPosition;
      } else {
        break;
      }
    }
    value += this._state.input.slice(chunkStart, this._state.currentPosition);
    if (value.length === 0) {
      throw new UnexpectedCharacterError(
        codePointToString(this._state.input.charCodeAt(this._state.currentPosition)),
        this._state.currentPosition,
      );
    }
    return this._createToken('ident', value);
  }

  _readMinus(): Token {
    const nextCharCode = this._state.input.charCodeAt(this._state.currentPosition + 1);
    if (nextCharCode && !isWhitespace(nextCharCode)) {
      return this._readIdentifier();
    }
    ++this._state.currentPosition;
    return this._createToken('minus');
  }

  _readNumber(): Token {
    const chunkStart = this._state.currentPosition;
    let isFloat = false;
    let charCode = this._state.input.charCodeAt(this._state.currentPosition);

    if (charCode === 46) { /* "." */
      ++this._state.currentPosition;
      isFloat = true;
    }

    this._consumeDigits();
    charCode = this._state.input.charCodeAt(this._state.currentPosition);

    if (charCode === 46) { /* "." */
      // If isFloat is true we already saw a "."
      if (isFloat) {
        throw new InvalidNumberError(chunkStart);
      }

      ++this._state.currentPosition;
      isFloat = true;
      this._consumeDigits();
      charCode = this._state.input.charCodeAt(this._state.currentPosition);
    }

    if (charCode === 69 || charCode === 101) { /* "E", "e" */
      charCode = this._state.input.charCodeAt(++this._state.currentPosition);
      if (charCode === 43 || charCode === 45) { /* "+", "-" */
        ++this._state.currentPosition;
      }
      if (this._consumeDigits() === 0) {
        throw new InvalidNumberError(chunkStart);
      }
      isFloat = true;
    }

    const value = this._state.input.slice(chunkStart, this._state.currentPosition);
    return this._createToken('num', isFloat ? parseFloat(value) : parseInt(value, 10));
  }

  _readString(quote: number): Token {
    let value = '';
    let chunkStart = ++this._state.currentPosition;
    for (;;) {
      if (this._state.currentPosition >= this._state.input.length) {
        throw new UnterminatedStringError(this._state.currentPosition);
      }
      const charCode = this._state.input.charCodeAt(this._state.currentPosition);
      if (charCode === quote) {
        break;
      }
      if (charCode === 92) { // "\"
        value += this._state.input.slice(chunkStart, this._state.currentPosition);
        value += this._readEscapedChar();
        chunkStart = this._state.currentPosition;
      } else {
        if (isNewLine(charCode)) {
          throw new UnterminatedStringError(this._state.currentPosition);
        }
        ++this._state.currentPosition;
      }
    }
    value += this._state.input.slice(chunkStart, this._state.currentPosition++);
    return this._createToken('string', value);
  }

  _readEscapedChar(): string {
    const charCode = this._state.input.charCodeAt(++this._state.currentPosition);
    switch (charCode) {
      case 110: ++this._state.currentPosition; return '\n';
      case 114: ++this._state.currentPosition; return '\r';
      case 116: ++this._state.currentPosition; return '\t';
      /**
       * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
       * If they do it, it must be right, right?
       */
      case 118: ++this._state.currentPosition; return '\u000b';
      case 10: case 12: case 13: /* "\n", "\f", "\r" */
        throw new UnexpectedCharacterError(
          codePointToString(charCode),
          this._state.currentPosition,
        );
      default:
        if (isHexDigit(charCode)) {
          return codePointToString(this._readHexChar());
        }

        ++this._state.currentPosition;
        return String.fromCharCode(charCode);
    }
  }

  _readHexChar(): number {
    const chunkStart = this._state.currentPosition;
    for (let i = 0; i < 6; ++i) {
      if (isHexDigit(this._state.input.charCodeAt(this._state.currentPosition))) {
        ++this._state.currentPosition;
      } else {
        break;
      }
    }

    const chunk = this._state.input.slice(chunkStart, this._state.currentPosition);
    // Consume a single whitespace or a "\r\n" if it directly follows the escape
    // sequence
    const charCode = this._state.input.charCodeAt(this._state.currentPosition);
    if (isWhitespace(charCode)) {
      ++this._state.currentPosition;
      // Consumed "\r", check if we can consume "\n"
      if (charCode === 13 && this._state.input.charCodeAt(this._state.currentPosition) === 10) {
        ++this._state.currentPosition;
      }
    }
    return parseInt(chunk, 16);
  }

  _readTilde(): Token {
    const next = this._state.input.charCodeAt(++this._state.currentPosition);
    if (next === 61) { // "="
      ++this._state.currentPosition;
      return this._createToken('matcher', '~=');
    }
    return this._createToken('combinator', '~');
  }

  _readTokenOrAttrMatcher(tokenType: TokenType): Token {
    const currentChar = this._state.input[this._state.currentPosition];
    const charCode = this._state.input.charCodeAt(++this._state.currentPosition);
    if (charCode === 61) { // "="
      ++this._state.currentPosition;
      return this._createToken('matcher', `${currentChar}=`);
    }
    return this._createToken(tokenType);
  }

  /**
   * Reads whitespace and returns a single token, any comment will be skipped
   */
  _readWhitespace(): Token {
    const start = this._state.currentPosition++;
    while (this._state.currentPosition < this._state.input.length) {
      const charCode = this._state.input.charCodeAt(this._state.currentPosition);
      if (isWhitespace(charCode)) {
        ++this._state.currentPosition;
      } else if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        break;
      }
    }

    lineBreak.lastIndex = start;
    let match;
    while (
      (match = lineBreak.exec(this._state.input)) &&
      (match.index < this._state.currentPosition)
    ) {
      ++this._state.currentLine;
      this._state.currentLineStart = match.index + match[0].length;
    }
    return this._createToken('whitespace');
  }

  _skipComment(): void {
    ++this._state.currentPosition;
    const charCode = this._getCharCodeOrThrowEof();
    if (charCode !== 42) {
      throw new UnexpectedCharacterError(
        codePointToString(charCode),
        this._state.currentPosition,
        codePointToString(42), // "*"
      );
    }
    const start = this._state.currentPosition++;
    const end = this._state.input.indexOf('*/', this._state.currentPosition);
    if (end === -1) {
      throw new UnterminatedCommentError(this._state.currentPosition);
    }
    this._state.currentPosition = end + 2;

    lineBreak.lastIndex = start;
    let match;
    while (
      (match = lineBreak.exec(this._state.input)) &&
      (match.index < this._state.currentPosition)
    ) {
      ++this._state.currentLine;
      this._state.currentLineStart = match.index + match[0].length;
    }
  }
}
