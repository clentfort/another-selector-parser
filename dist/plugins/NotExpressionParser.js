'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotExpressionArgument = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Plugin2 = require('./Plugin');

var _Plugin3 = _interopRequireDefault(_Plugin2);

var _Errors = require('../parser/util/Errors');

var _nodes = require('../util/nodes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotExpressionArgument = exports.NotExpressionArgument = function (_Node) {
  _inherits(NotExpressionArgument, _Node);

  function NotExpressionArgument(value) {
    _classCallCheck(this, NotExpressionArgument);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NotExpressionArgument).call(this, 'NotExpressionArgument'));

    _this.value = value;
    return _this;
  }

  _createClass(NotExpressionArgument, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.value);
    }
  }]);

  return NotExpressionArgument;
}(_nodes.Node);

var NotExpressionParser = function (_Plugin) {
  _inherits(NotExpressionParser, _Plugin);

  function NotExpressionParser() {
    _classCallCheck(this, NotExpressionParser);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NotExpressionParser).apply(this, arguments));
  }

  _createClass(NotExpressionParser, [{
    key: 'parse',

    // $FlowIssue
    value: function parse() {
      this._parser.pushContext({
        name: 'NotExpressionParser.parse',
        emitWhitespace: false
      });

      var params = [];
      while (this._parser.getCurrentToken().type !== 'parenR') {
        var start = this._parser.getCurrentToken();
        var simpleSelector = this._parser.parseSimpleSelector1();
        params.push(this._parser.finishNode(new NotExpressionArgument(simpleSelector), simpleSelector, start));
        if (this._parser.getCurrentToken().type === 'comma') {
          this._parser.nextToken();
        } else if (this._parser.getCurrentToken().type !== 'parenR') {
          throw new _Errors.UnexpectedTokenError(this._parser.getCurrentToken(), ['comma', 'parenR']);
        }
      }
      this._parser.nextToken();

      this._parser.popContext('NotExpressionParser.parse');
      return params;
    }
  }], [{
    key: 'getTargetNode',
    value: function getTargetNode() {
      return 'CallExpression';
    }
  }, {
    key: 'getTargetExpression',
    value: function getTargetExpression() {
      return 'not';
    }
  }, {
    key: 'getNewAstNodes',
    value: function getNewAstNodes() {
      return [NotExpressionArgument];
    }
  }]);

  return NotExpressionParser;
}(_Plugin3.default);

exports.default = NotExpressionParser;
