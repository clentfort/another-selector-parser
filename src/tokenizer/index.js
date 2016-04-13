/* @flow */
import codePointToString from './util/codePointToString';
import isNewLine from './util/isNewLine';
import isHexDigit from './util/isHexDigit';
import isWhitespace from './util/isWhitespace';
import { 
  EmptyIdTokenError, 
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
      let charCode = this.input.charCodeAt(this.position);
      if (charCode === 47) { // "/"
        this._skipComment();
      } else {
        yield this._getTokenFromCode(charCode);
      }
    }
    yield { type: tt.eof };
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
      case 44: /* , */
        ++this.position; return { type: tt.comma };
      case 46: /* "." */
        ++this.position; return { type: tt.dot };
      case 45: /* "-" */
        ++this.position; return { type: tt.minus };
      case 40: /* "(" */
        ++this.position; return { type: tt.parenL };
      case 41: /* ")" */
        ++this.position; return { type: tt.parenR };
      case 37: /* "%" */
        ++this.position; return { type: tt.percentage };
      case 43: /* "+" */
        ++this.position; return { type: tt.plus };
      case 62: /* ">" */
        ++this.position; return { type: tt.greater };
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
        return this._readId();
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
    }
    throw new UnexpectedCharacterError(
      codePointToString(charCode), 
      this.position,
    );
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

  _readId(): Token {
    let value = '';
    let chunkStart = ++this.position;
    while (this.position < this.input.length) {
      const charCode = this.input.charCodeAt(this.position);
      /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
      if (
        (charCode === 45) /* "-" */ || 
        (charCode === 95) /* "_" */ || 
        (charCode >= 48 && charCode <= 57) /* 0 - 9 */ ||
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
      throw new EmptyIdTokenError(this.position);
    }
    return { type: tt.id, value };
  }

  _readNumber(): Token {
    let value = '';
    let isFloat = false;
    while (true) {
      let charCode = this.input.charCodeAt(this.position);
      let char = this.input[this.position++];
      if (charCode >= 48 && charCode <= 57) {
        value += char;
      } else if (charCode === 46) { // "."
        if (isFloat) {
          throw new UnexpectedCharacterError(
            codePointToString(charCode),
            this.position,
          );
        }
        value += char;
        isFloat = true;
      } else {
        break;
      }
    }
    return { 
      type: tt.num, 
      value: isFloat ? parseFloat(value) : parseInt(value),
    };
  }

  _readString(quote: number): Token {
    let value = '';
    let chunkStart = ++this.position;
    while (true) {
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
    let charCode = this.input.charCodeAt(++this.position);
    switch (charCode) {
      case 48: case 49: case 50: case 51: case 52: // 0 - 4
      case 53: case 54: case 55: case 56: case 57: // 5 - 9
      case 65: case 66: case 67: case 68: case 69: case 70: // A - F
      case 97: case 98: case 99: case 100: case 101: case 102: // a - f
        return codePointToString(this._readHexChar());
      case 110: ++this.position; return "\n";
      case 114: ++this.position; return "\r";
      case 116: ++this.position; return "\t";
      /**
       * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
       * If they do it, it must be right, right?
       */
      case 118: ++this.position; return "\u000b";
      case 10: case 12: case 13:
        throw new UnexpectedCharacterError(
          codePointToString(charCode), 
          this.position,
        );
      default: ++this.position; return String.fromCharCode(charCode);
    }
  }

  _readHexChar(): number {
    let chunk = this.input[this.position++];
    for (let i = 0; i < 5; ++i) {
      const charCode = this.input.charCodeAt(this.position);
      if (isHexDigit(charCode)) {
        chunk += this.input[this.position++];
      } else {
        break;
      }
    }

    // Consume a single whitespace if it directly follows the escape sequence
    if (isWhitespace(this.input.charCodeAt(this.position))) {
      ++this.position;
    }
    return parseInt(chunk, 16);
  }

  _readTilde(): Token {
    const next = this.input.charCodeAt(++this.position);
    if (next === 61) { // "="
      ++this.position;
      return { type: tt.attrMatcher, value: '~=' };
    }
    return { type: tt.tilde };
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
      let charCode = this.input.charCodeAt(this.position);
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
