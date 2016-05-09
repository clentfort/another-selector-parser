'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidContextError = exports.UnfinishedSelectorError = exports.UnexpectedTokenError = exports.UnexpectedEofError = undefined;

var _Error = require('../../util/Error');

var _Error2 = _interopRequireDefault(_Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnexpectedEofError = exports.UnexpectedEofError = function (_AnotherSelectorParse) {
  _inherits(UnexpectedEofError, _AnotherSelectorParse);

  function UnexpectedEofError(actual) {
    _classCallCheck(this, UnexpectedEofError);

    var end = '.';
    if (actual.loc) {
      var _actual$loc$start = actual.loc.start;
      var line = _actual$loc$start.line;
      var column = _actual$loc$start.column;

      end = ' on line ' + line + ', column ' + column + '.';
    }
    return _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedEofError).call(this, 'Unexpected end of input' + end));
  }

  return UnexpectedEofError;
}(_Error2.default);

var UnexpectedTokenError = exports.UnexpectedTokenError = function (_AnotherSelectorParse2) {
  _inherits(UnexpectedTokenError, _AnotherSelectorParse2);

  function UnexpectedTokenError(actual, expected, value) {
    _classCallCheck(this, UnexpectedTokenError);

    var start = 'Unexpected token of type "' + actual.type + '"';
    var end = '.';
    if (actual.loc) {
      var _actual$loc$start2 = actual.loc.start;
      var line = _actual$loc$start2.line;
      var column = _actual$loc$start2.column;

      end = ' on line ' + line + ', column ' + column + '.';
    }
    if (typeof expected === 'string') {
      var withValueOf = '';
      if (value) {
        withValueOf = ' with a value of "' + value + '"';
      }

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedTokenError).call(this, start + ', expected "' + expected + '"' + withValueOf + end));
    } else if (Array.isArray(expected)) {
      var allExpected = expected.join('", "');

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedTokenError).call(this, start + ', expected one of "' + allExpected + '"' + end));
    } else {
      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(UnexpectedTokenError).call(this, '' + start + end));
    }
    return _possibleConstructorReturn(_this2);
  }

  return UnexpectedTokenError;
}(_Error2.default);

var UnfinishedSelectorError = exports.UnfinishedSelectorError = function (_AnotherSelectorParse3) {
  _inherits(UnfinishedSelectorError, _AnotherSelectorParse3);

  function UnfinishedSelectorError() {
    _classCallCheck(this, UnfinishedSelectorError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(UnfinishedSelectorError).call(this, 'Unfinished selector'));
  }

  return UnfinishedSelectorError;
}(_Error2.default);

var InvalidContextError = exports.InvalidContextError = function (_AnotherSelectorParse4) {
  _inherits(InvalidContextError, _AnotherSelectorParse4);

  function InvalidContextError(name, current) {
    _classCallCheck(this, InvalidContextError);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidContextError).call(this, 'Trying to pop context with name "' + name + '", but the current context is "' + current + '"'));
  }

  return InvalidContextError;
}(_Error2.default);
