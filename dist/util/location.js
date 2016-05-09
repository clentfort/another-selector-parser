"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = exports.Position = function () {
  function Position(line, column) {
    _classCallCheck(this, Position);

    this.column = column;
    this.line = line;
  }

  _createClass(Position, [{
    key: "clone",
    value: function clone() {
      return new Position(this.line, this.column);
    }
  }]);

  return Position;
}();

var SourceLocation = exports.SourceLocation = function () {
  function SourceLocation(start, end) {
    _classCallCheck(this, SourceLocation);

    this.start = start;
    this.end = end;
  }

  _createClass(SourceLocation, [{
    key: "clone",
    value: function clone() {
      return new SourceLocation(this.start.clone(), this.end.clone());
    }
  }]);

  return SourceLocation;
}();
