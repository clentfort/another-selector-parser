'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NthChildExpressionWithOfSelectorArgument = exports.NthChildExpressionArgument = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Plugin2 = require('./Plugin');

var _Plugin3 = _interopRequireDefault(_Plugin2);

var _Errors = require('../parser/util/Errors');

var _nodes = require('../util/nodes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NthChildExpressionArgument = exports.NthChildExpressionArgument = function (_Node) {
  _inherits(NthChildExpressionArgument, _Node);

  function NthChildExpressionArgument(step, offset) {
    _classCallCheck(this, NthChildExpressionArgument);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NthChildExpressionArgument).call(this, 'NthChildExpressionArgument'));

    _this.step = step;
    _this.offset = offset;
    return _this;
  }

  _createClass(NthChildExpressionArgument, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.step);
      traverser.visit(this.offset);
    }
  }]);

  return NthChildExpressionArgument;
}(_nodes.Node);

var NthChildExpressionWithOfSelectorArgument = exports.NthChildExpressionWithOfSelectorArgument = function (_NthChildExpressionAr) {
  _inherits(NthChildExpressionWithOfSelectorArgument, _NthChildExpressionAr);

  function NthChildExpressionWithOfSelectorArgument(step, offset, of) {
    _classCallCheck(this, NthChildExpressionWithOfSelectorArgument);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(NthChildExpressionWithOfSelectorArgument).call(this, step, offset));

    _this2.of = of;
    return _this2;
  }

  _createClass(NthChildExpressionWithOfSelectorArgument, [{
    key: 'accept',
    value: function accept(traverser) {
      _get(Object.getPrototypeOf(NthChildExpressionWithOfSelectorArgument.prototype), 'accept', this).call(this, traverser);
      traverser.visit(this.of);
    }
  }]);

  return NthChildExpressionWithOfSelectorArgument;
}(NthChildExpressionArgument);

var offsetRegExp = /^n(-\d+)$/i;

var NthChildExpressionParser = function (_Plugin) {
  _inherits(NthChildExpressionParser, _Plugin);

  function NthChildExpressionParser() {
    _classCallCheck(this, NthChildExpressionParser);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(NthChildExpressionParser).apply(this, arguments));
  }

  _createClass(NthChildExpressionParser, [{
    key: '_parseNextNumber',

    // } {
    //

    // @TODO: Need something more reliable to parse numbers
    value: function _parseNextNumber() {
      var prefix = this._parser.getCurrentToken();
      if (prefix.type === 'num') {
        return this._parser.parseNumberLiteral();
      }
      if (prefix.type === 'ident' && prefix.value[0] === '-') {
        var node = this._parser.finishNode(new _nodes.NumberLiteral(parseInt(prefix.value, 10)), prefix);
        this._parser.nextToken();
        return node;
      }
      if (prefix.type !== 'plus' && prefix.type !== 'minus') {
        throw new _Errors.UnexpectedTokenError(prefix, ['plus', 'minus']);
      }
      this._parser.nextToken();
      var number = this._parser.parseNumberLiteral();
      if (prefix.type === 'minus') {
        number.value = -number.value;
      }
      return number;
    }

    // $FlowFixMe

  }, {
    key: 'parse',
    value: function parse() {
      this._parser.pushContext({
        emitWhitespace: false,
        name: 'NthChildExpressionParser.parse'
      });
      var start = this._parser.getCurrentToken();
      var step = this._parseNextNumber();
      var startToken = this._parser.getCurrentToken();
      var n = this._parser.parseIdentifier();
      var offset = void 0;
      var value = n.value.toLowerCase();
      if (value === 'n') {
        offset = this._parseNextNumber();
      } else if (value === 'n-') {
        offset = this._parseNextNumber();
        offset.value = -offset.value;
      } else {
        var matching = value.match(offsetRegExp);
        if (matching && matching[1]) {
          offset = new _nodes.NumberLiteral(-parseInt(matching[1], 10));
        } else {
          throw new _Errors.UnexpectedTokenError(startToken, 'ident', 'n');
        }
      }

      var possibleParenR = this._parser.getCurrentToken();
      if (possibleParenR.type === 'parenR') {
        this._parser.nextToken();
        this._parser.popContext('NthChildExpressionParser.parse');
        return [this._parser.finishNode(new NthChildExpressionArgument(step, offset), possibleParenR, start)];
      }

      if (possibleParenR.type !== 'ident' || possibleParenR.value.toLowerCase() !== 'of') {
        throw new _Errors.UnexpectedTokenError(this._parser.getCurrentToken(), 'ident', 'of');
      }
      this._parser.nextToken();

      this._parser.popContext('NthChildExpressionParser.parse');
      this._parser.pushContext({
        name: 'NthChildExpressionParser.parseOf',
        emitWhitespace: true,
        shouldStopAt: function shouldStopAt(token) {
          return token.type === 'parenR';
        }
      });
      var selectorList = this._parser.parseSelectorList();
      var parenR = this._parser.nextToken();

      this._parser.popContext('NthChildExpressionParser.parseOf');

      return [this._parser.finishNode(new NthChildExpressionWithOfSelectorArgument(step, offset, selectorList), parenR, start)];
    }
  }], [{
    key: 'getTargetNode',
    value: function getTargetNode() {
      return 'CallExpression';
    }
  }, {
    key: 'getTargetExpression',
    value: function getTargetExpression() {
      return 'nth-child';
    }
  }, {
    key: 'getNewAstNodes',
    value: function getNewAstNodes() {
      return [NthChildExpressionArgument, NthChildExpressionWithOfSelectorArgument];
    }
  }]);

  return NthChildExpressionParser;
}(_Plugin3.default);

exports.default = NthChildExpressionParser;
