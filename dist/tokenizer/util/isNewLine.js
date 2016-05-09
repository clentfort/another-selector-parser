"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNewLine;
var lineBreak = exports.lineBreak = /\r\n?|\n/g;

function isNewLine(charCode) {
  return charCode === 10 || charCode === 12 || charCode === 13;
}
