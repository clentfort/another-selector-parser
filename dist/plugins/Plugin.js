'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plugin = function () {
  function Plugin(parser) {
    _classCallCheck(this, Plugin);

    this._parser = parser;
  }

  _createClass(Plugin, [{
    key: 'parse',
    value: function parse() {
      throw new Error('You called `parse` on the Plugin-Prototype, not on an actual Plugin');
    }
  }], [{
    key: 'getNewAstNodes',
    value: function getNewAstNodes() {
      throw new Error('You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin');
    }
  }, {
    key: 'getTargetNode',
    value: function getTargetNode() {
      throw new Error('You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin');
    }
  }, {
    key: 'getTargetExpression',
    value: function getTargetExpression() {
      throw new Error('You called `getNewAstNodes` on the Plugin-Prototype, not on an actual Plugin');
    }
  }]);

  return Plugin;
}();

exports.default = Plugin;
