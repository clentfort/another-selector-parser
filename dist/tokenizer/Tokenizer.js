'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _codePointToString = require('./util/codePointToString');

var _codePointToString2 = _interopRequireDefault(_codePointToString);

var _isDigit = require('./util/isDigit');

var _isDigit2 = _interopRequireDefault(_isDigit);

var _isHexDigit = require('./util/isHexDigit');

var _isHexDigit2 = _interopRequireDefault(_isHexDigit);

var _isNewLine = require('./util/isNewLine');

var _isNewLine2 = _interopRequireDefault(_isNewLine);

var _isLetter = require('./util/isLetter');

var _isLetter2 = _interopRequireDefault(_isLetter);

var _isWhitespace = require('./util/isWhitespace');

var _isWhitespace2 = _interopRequireDefault(_isWhitespace);

var _Errors = require('./util/Errors');

var _location = require('../util/location');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function () {
  function State(input) {
    _classCallCheck(this, State);

    this.input = input;
    this.previousLine = this.currentLine = 1;
    this.previousLineStart = this.currentLineStart = 0;
    this.previousPosition = this.currentPosition = 0;
    this.emitWhitespace = true;
  }

  _createClass(State, [{
    key: 'clone',
    value: function clone() {
      // $FlowFixMe
      var state = new State();
      /* eslint-disable guard-for-in */
      for (var key in this) {
        var value = this[key];
        state[key] = value;
      }
      /* eslint-enable guard-for-in */
      return state;
    }
  }]);

  return State;
}();

var Tokenizer = function () {
  function Tokenizer(input) {
    _classCallCheck(this, Tokenizer);

    this._state = new State(input);
  }

  _createClass(Tokenizer, [{
    key: 'peek',
    value: function peek() {
      if (!!this._originalState) {
        // Already peeking
        throw new Error();
      }
      this._originalState = this._state;
      this._state = this._state.clone();
    }
  }, {
    key: 'skip',
    value: function skip() {
      this._originalState = null;
    }
  }, {
    key: 'backup',
    value: function backup() {
      if (!this._originalState) {
        // Not peeking
        throw new Error();
      }
      this._state = this._originalState;
      this._originalState = null;
    }
  }, {
    key: 'emitWhitespace',
    value: function emitWhitespace(_emitWhitespace) {
      this._state.emitWhitespace = _emitWhitespace;
    }
  }, {
    key: 'nextToken',
    value: function nextToken() {
      while (this._state.currentPosition < this._state.input.length) {
        // @TODO: Use something similar to [fullCharCodeAtPos]
        // (https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L149-L155)
        var charCode = this._state.input.charCodeAt(this._state.currentPosition);
        if (charCode === 47) {
          /* "\" */
          this._skipComment();
          this._state.previousLine = this._state.currentLine;
          this._state.previousLineStart = this._state.currentLineStart;
          this._state.previousPosition = this._state.currentPosition;
        } else {
          var token = this._getTokenFromCode(charCode);
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
  }, {
    key: '_createToken',
    value: function _createToken(type, value) {
      var start = new _location.Position(this._state.previousLine, this._state.previousPosition - this._state.previousLineStart);
      var end = new _location.Position(this._state.currentLine, this._state.currentPosition - this._state.currentLineStart);

      this._state.previousPosition = this._state.currentPosition;
      this._state.previousLine = this._state.currentLine;
      this._state.previousLineStart = this._state.currentLineStart;
      var token = { type: type, loc: new _location.SourceLocation(start, end) };
      if (value) {
        token.value = value;
      }
      return token;
    }
  }, {
    key: '_consumeDigits',
    value: function _consumeDigits() {
      var chunkStart = this._state.currentPosition;
      while (this._state.currentPosition < this._state.input.length) {
        if ((0, _isDigit2.default)(this._state.input.charCodeAt(this._state.currentPosition))) {
          ++this._state.currentPosition;
        } else {
          break;
        }
      }
      return this._state.currentPosition - chunkStart;
    }
  }, {
    key: '_getCharCodeOrThrowEof',
    value: function _getCharCodeOrThrowEof() {
      if (this._state.currentPosition >= this._state.input.length) {
        throw new _Errors.UnexpectedEofError(this._state.currentPosition);
      }
      return this._state.input.charCodeAt(this._state.currentPosition);
    }
  }, {
    key: '_getTokenFromCode',
    value: function _getTokenFromCode(charCode) {
      switch (charCode) {
        case 91:
          /* "[" */
          ++this._state.currentPosition;return this._createToken('bracketL');
        case 93:
          /* "]" */
          ++this._state.currentPosition;return this._createToken('bracketR');
        case 58:
          /* ":" */
          ++this._state.currentPosition;return this._createToken('colon');
        case 44:
          /* "," */
          ++this._state.currentPosition;return this._createToken('comma');
        case 35:
          /* "#" */
          ++this._state.currentPosition;return this._createToken('hash');
        case 40:
          /* "(" */
          ++this._state.currentPosition;return this._createToken('parenL');
        case 41:
          /* ")" */
          ++this._state.currentPosition;return this._createToken('parenR');
        case 37:
          /* "%" */
          ++this._state.currentPosition;return this._createToken('percentage');
        case 43:
          /* "+" */
          ++this._state.currentPosition;return this._createToken('plus');
        case 61:
          /* "=" */
          ++this._state.currentPosition;return this._createToken('matcher', '=');
        case 42:
          /* "*" */
          return this._readTokenOrAttrMatcher('star');
        case 124:
          /* "|" */
          return this._readTokenOrAttrMatcher('pipe');
        case 126:
          /* "~" */
          return this._readTilde();
        case 46:
          /* "." */
          return this._readDot();
        case 45:
          /* "-" */
          return this._readMinus();
        case 62:
          /* ">" */
          return this._readGreater();
        case 36: /* "$" */
        case 94:
          /* "^" */
          return this._readAttrMatcher();
        case 34: /* '"' */
        case 39:
          /* "'" */
          return this._readString(charCode);
        case 9: /* "\t" (Tab) */
        case 10: /* "\n" (Line break) */
        case 12: /* "\f" (Form feed) */
        case 13: /* "\r" (Carriage return) */
        case 32:
          /* " " (Space) */
          return this._readWhitespace();
        default:
          return (0, _isDigit2.default)(charCode) ? this._readNumber() : this._readIdentifier();
      }
    }
  }, {
    key: '_readAttrMatcher',
    value: function _readAttrMatcher() {
      var type = this._state.input[this._state.currentPosition++];
      var charCode = this._getCharCodeOrThrowEof();
      if (charCode === 61) {
        // "="
        ++this._state.currentPosition;
        return this._createToken('matcher', type + '=');
      }
      throw new _Errors.UnexpectedCharacterError((0, _codePointToString2.default)(charCode), this._state.currentPosition, (0, _codePointToString2.default)(61));
    }
  }, {
    key: '_readDot',
    // '="
    value: function _readDot() {
      var nextCharCode = this._state.input.charCodeAt(this._state.currentPosition + 1);
      if ((0, _isDigit2.default)(nextCharCode)) {
        return this._readNumber();
      }
      ++this._state.currentPosition;
      return this._createToken('dot');
    }
  }, {
    key: '_readGreater',
    value: function _readGreater() {
      var nextCharCode = this._state.input.charCodeAt(++this._state.currentPosition);
      if (nextCharCode === 62) {
        ++this._state.currentPosition;
        return this._createToken('combinator', '>>');
      }
      return this._createToken('combinator', '>');
    }
  }, {
    key: '_readIdentifier',
    value: function _readIdentifier() {
      var value = '';
      var chunkStart = this._state.currentPosition;
      while (this._state.currentPosition < this._state.input.length) {
        var charCode = this._state.input.charCodeAt(this._state.currentPosition);
        /* See https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier) */
        if (charCode === 45 || /* "-" */charCode === 95 /* "_" */ || (0, _isDigit2.default)(charCode) || (0, _isLetter2.default)(charCode) || charCode >= 0x00A0 && charCode <= 0x10FFFF) {
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
        throw new _Errors.UnexpectedCharacterError((0, _codePointToString2.default)(this._state.input.charCodeAt(this._state.currentPosition)), this._state.currentPosition);
      }
      return this._createToken('ident', value);
    }
  }, {
    key: '_readMinus',
    value: function _readMinus() {
      var nextCharCode = this._state.input.charCodeAt(this._state.currentPosition + 1);
      if (nextCharCode && !(0, _isWhitespace2.default)(nextCharCode)) {
        return this._readIdentifier();
      }
      ++this._state.currentPosition;
      return this._createToken('minus');
    }
  }, {
    key: '_readNumber',
    value: function _readNumber() {
      var chunkStart = this._state.currentPosition;
      var isFloat = false;
      var charCode = this._state.input.charCodeAt(this._state.currentPosition);

      if (charCode === 46) {
        /* "." */
        ++this._state.currentPosition;
        isFloat = true;
      }

      this._consumeDigits();
      charCode = this._state.input.charCodeAt(this._state.currentPosition);

      if (charCode === 46) {
        /* "." */
        // If isFloat is true we already saw a "."
        if (isFloat) {
          throw new _Errors.InvalidNumberError(chunkStart);
        }

        ++this._state.currentPosition;
        isFloat = true;
        this._consumeDigits();
        charCode = this._state.input.charCodeAt(this._state.currentPosition);
      }

      if (charCode === 69 || charCode === 101) {
        /* "E", "e" */
        charCode = this._state.input.charCodeAt(++this._state.currentPosition);
        if (charCode === 43 || charCode === 45) {
          /* "+", "-" */
          ++this._state.currentPosition;
        }
        if (this._consumeDigits() === 0) {
          throw new _Errors.InvalidNumberError(chunkStart);
        }
        isFloat = true;
      }

      var value = this._state.input.slice(chunkStart, this._state.currentPosition);
      return this._createToken('num', isFloat ? parseFloat(value) : parseInt(value, 10));
    }
  }, {
    key: '_readString',
    value: function _readString(quote) {
      var value = '';
      var chunkStart = ++this._state.currentPosition;
      for (;;) {
        if (this._state.currentPosition >= this._state.input.length) {
          throw new _Errors.UnterminatedStringError(this._state.currentPosition);
        }
        var charCode = this._state.input.charCodeAt(this._state.currentPosition);
        if (charCode === quote) {
          break;
        }
        if (charCode === 92) {
          // "\"
          value += this._state.input.slice(chunkStart, this._state.currentPosition);
          value += this._readEscapedChar();
          chunkStart = this._state.currentPosition;
        } else {
          if ((0, _isNewLine2.default)(charCode)) {
            throw new _Errors.UnterminatedStringError(this._state.currentPosition);
          }
          ++this._state.currentPosition;
        }
      }
      value += this._state.input.slice(chunkStart, this._state.currentPosition++);
      return this._createToken('string', value);
    }
  }, {
    key: '_readEscapedChar',
    value: function _readEscapedChar() {
      var charCode = this._state.input.charCodeAt(++this._state.currentPosition);
      switch (charCode) {
        case 110:
          ++this._state.currentPosition;return '\n';
        case 114:
          ++this._state.currentPosition;return '\r';
        case 116:
          ++this._state.currentPosition;return '\t';
        /**
         * Copied from [Babylon](https://github.com/babel/babylon/blob/master/src/tokenizer/index.js#L676)
         * If they do it, it must be right, right?
         */
        case 118:
          ++this._state.currentPosition;return '\u000b';
        case 10:case 12:case 13:
          /* "\n", "\f", "\r" */
          throw new _Errors.UnexpectedCharacterError((0, _codePointToString2.default)(charCode), this._state.currentPosition);
        default:
          if ((0, _isHexDigit2.default)(charCode)) {
            return (0, _codePointToString2.default)(this._readHexChar());
          }

          ++this._state.currentPosition;
          return String.fromCharCode(charCode);
      }
    }
  }, {
    key: '_readHexChar',
    value: function _readHexChar() {
      var chunkStart = this._state.currentPosition;
      for (var i = 0; i < 6; ++i) {
        if ((0, _isHexDigit2.default)(this._state.input.charCodeAt(this._state.currentPosition))) {
          ++this._state.currentPosition;
        } else {
          break;
        }
      }

      var chunk = this._state.input.slice(chunkStart, this._state.currentPosition);
      // Consume a single whitespace or a "\r\n" if it directly follows the escape
      // sequence
      var charCode = this._state.input.charCodeAt(this._state.currentPosition);
      if ((0, _isWhitespace2.default)(charCode)) {
        ++this._state.currentPosition;
        // Consumed "\r", check if we can consume "\n"
        if (charCode === 13 && this._state.input.charCodeAt(this._state.currentPosition) === 10) {
          ++this._state.currentPosition;
        }
      }
      return parseInt(chunk, 16);
    }
  }, {
    key: '_readTilde',
    value: function _readTilde() {
      var next = this._state.input.charCodeAt(++this._state.currentPosition);
      if (next === 61) {
        // "="
        ++this._state.currentPosition;
        return this._createToken('matcher', '~=');
      }
      return this._createToken('combinator', '~');
    }
  }, {
    key: '_readTokenOrAttrMatcher',
    value: function _readTokenOrAttrMatcher(tokenType) {
      var currentChar = this._state.input[this._state.currentPosition];
      var charCode = this._state.input.charCodeAt(++this._state.currentPosition);
      if (charCode === 61) {
        // "="
        ++this._state.currentPosition;
        return this._createToken('matcher', currentChar + '=');
      }
      return this._createToken(tokenType);
    }

    /**
     * Reads whitespace and returns a single token, any comment will be skipped
     */

  }, {
    key: '_readWhitespace',
    value: function _readWhitespace() {
      var start = this._state.currentPosition++;
      while (this._state.currentPosition < this._state.input.length) {
        var charCode = this._state.input.charCodeAt(this._state.currentPosition);
        if ((0, _isWhitespace2.default)(charCode)) {
          ++this._state.currentPosition;
        } else if (charCode === 47) {
          // "/"
          this._skipComment();
        } else {
          break;
        }
      }

      _isNewLine.lineBreak.lastIndex = start;
      var match = void 0;
      while ((match = _isNewLine.lineBreak.exec(this._state.input)) && match.index < this._state.currentPosition) {
        ++this._state.currentLine;
        this._state.currentLineStart = match.index + match[0].length;
      }
      return this._createToken('whitespace');
    }
  }, {
    key: '_skipComment',
    value: function _skipComment() {
      ++this._state.currentPosition;
      var charCode = this._getCharCodeOrThrowEof();
      if (charCode !== 42) {
        throw new _Errors.UnexpectedCharacterError((0, _codePointToString2.default)(charCode), this._state.currentPosition, (0, _codePointToString2.default)(42));
      }
      // "*"
      var start = this._state.currentPosition++;
      var end = this._state.input.indexOf('*/', this._state.currentPosition);
      if (end === -1) {
        throw new _Errors.UnterminatedCommentError(this._state.currentPosition);
      }
      this._state.currentPosition = end + 2;

      _isNewLine.lineBreak.lastIndex = start;
      var match = void 0;
      while ((match = _isNewLine.lineBreak.exec(this._state.input)) && match.index < this._state.currentPosition) {
        ++this._state.currentLine;
        this._state.currentLineStart = match.index + match[0].length;
      }
    }
  }]);

  return Tokenizer;
}();

exports.default = Tokenizer;
