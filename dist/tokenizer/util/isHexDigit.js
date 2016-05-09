'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isHexDigit;

var _isDigit = require('./isDigit');

var _isDigit2 = _interopRequireDefault(_isDigit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isHexDigit(charCode) {
  return (0, _isDigit2.default)(charCode) || charCode >= 65 && charCode <= 70 /* A - F */ || charCode >= 97 && charCode <= 102 /* a - f */
  ;
}
