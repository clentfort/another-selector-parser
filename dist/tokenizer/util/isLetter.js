"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isLetter;
function isLetter(charCode) {
  return charCode >= 65 && charCode <= 90 || /* A - Z */charCode >= 97 && charCode <= 122 /* a - z */
  ;
}
