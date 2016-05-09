'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isWhitespace;

var _isNewLine = require('./isNewLine');

var _isNewLine2 = _interopRequireDefault(_isNewLine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isWhitespace(charCode) {
  return charCode === 9 || /* "\t" */
  charCode === 32 || /* " " */
  (0, _isNewLine2.default)(charCode);
}
