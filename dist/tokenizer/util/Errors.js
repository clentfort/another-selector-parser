'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnterminatedStringError = exports.UnterminatedCommentError = exports.UnexpectedEofError = exports.UnexpectedCharacterError = exports.InvalidNumberError = undefined;

var _Error = require('../../util/Error');

var _Error2 = _interopRequireDefault(_Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InvalidNumberError = exports.InvalidNumberError = function (_AnotherSelectorParse) {
  _inherits(InvalidNumberError, _AnotherSelectorParse);

  function InvalidNumberError(position) {
    _classCallCheck(this, InvalidNumberError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidNumberError).call(this, 'Invalid number starting at position ' + position + '.'));
  }

  return InvalidNumberError;
}(_Error2.default);

var UnexpectedCharacterError = exports.UnexpectedCharacterError = function (_AnotherSelectorParse2) {
  _inherits(UnexpectedCharacterError, _AnotherSelectorParse2);

  function UnexpectedCharacterError(actual, position, expected) {
    _classCallCheck(this, UnexpectedCharacterError);

    if (!!expected) {
      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedCharacterError).call(this, 'Unexpected char "' + actual + '" at position ' + position + ', expected "' + expected + '".'));
    } else {
      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedCharacterError).call(this, 'Unexpected char "' + actual + '" at position ' + position + '.'));
    }
    return _possibleConstructorReturn(_this2);
  }

  return UnexpectedCharacterError;
}(_Error2.default);

var UnexpectedEofError = exports.UnexpectedEofError = function (_AnotherSelectorParse3) {
  _inherits(UnexpectedEofError, _AnotherSelectorParse3);

  function UnexpectedEofError(position, expected) {
    _classCallCheck(this, UnexpectedEofError);

    if (!!expected) {
      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedEofError).call(this, 'Unexpected end of input at position ' + position + ', expected "' + expected + '".'));
    } else {
      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedEofError).call(this, 'Unexpected end of input at position ' + position + '.'));
    }
    return _possibleConstructorReturn(_this3);
  }

  return UnexpectedEofError;
}(_Error2.default);

var UnterminatedCommentError = exports.UnterminatedCommentError = function (_AnotherSelectorParse4) {
  _inherits(UnterminatedCommentError, _AnotherSelectorParse4);

  function UnterminatedCommentError(position) {
    _classCallCheck(this, UnterminatedCommentError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(UnterminatedCommentError).call(this, 'Unterminated comment at position ' + position + '.'));
  }

  return UnterminatedCommentError;
}(_Error2.default);

var UnterminatedStringError = exports.UnterminatedStringError = function (_AnotherSelectorParse5) {
  _inherits(UnterminatedStringError, _AnotherSelectorParse5);

  function UnterminatedStringError(position) {
    _classCallCheck(this, UnterminatedStringError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(UnterminatedStringError).call(this, 'Unterminated string constant at position ' + position + '.'));
  }

  return UnterminatedStringError;
}(_Error2.default);
