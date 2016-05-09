'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodes = require('../util/nodes');

var nodes = _interopRequireWildcard(_nodes);

var _generateShouldVisitForNodeT = require('./util/generateShouldVisitForNodeT');

var _generateShouldVisitForNodeT2 = _interopRequireDefault(_generateShouldVisitForNodeT);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultShouldVisitMap = Object.keys(nodes).reduce(function (result, nodeType) {
  result[nodeType] = (0, _generateShouldVisitForNodeT2.default)(nodes[nodeType]);
  return result;
}, {});

var Visitor = function () {
  function Visitor(visitors) {
    _classCallCheck(this, Visitor);

    this._shouldVisitMap = _extends({}, defaultShouldVisitMap);
    this._visitors = visitors;
  }

  _createClass(Visitor, [{
    key: 'setPlugin',
    value: function setPlugin(plugin) {
      var _this = this;

      plugin.getNewAstNodes().forEach(function (nodeT) {
        _this._shouldVisitMap[nodeT.name] = (0, _generateShouldVisitForNodeT2.default)(nodeT);
      });
    }
  }, {
    key: 'visit',
    value: function visit(node) {
      var _this2 = this;

      Object.keys(this._shouldVisitMap).forEach(function (nodeType) {
        var shouldVisit = _this2._shouldVisitMap[nodeType];
        if (!!_this2._visitors[nodeType] && shouldVisit(node)) {
          _this2._visitors[nodeType](node);
        }
      });
      node.accept(this);
    }
  }]);

  return Visitor;
}();

exports.default = Visitor;
