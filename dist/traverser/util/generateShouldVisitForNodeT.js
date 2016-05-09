'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateShouldVisitForNodeT;
function generateShouldVisitForNodeT(nodeT) {
  return function (node) {
    return node instanceof nodeT;
  };
}
