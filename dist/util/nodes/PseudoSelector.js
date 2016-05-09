'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallExpression = exports.PseudoElementSelector = exports.PseudoClassSelector = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Node2 = require('./Node');

var _Node3 = _interopRequireDefault(_Node2);

var _SimpleSelector2 = require('./SimpleSelector');

var _SimpleSelector3 = _interopRequireDefault(_SimpleSelector2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PseudoSelector = function (_SimpleSelector) {
  _inherits(PseudoSelector, _SimpleSelector);

  function PseudoSelector(type, value) {
    _classCallCheck(this, PseudoSelector);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PseudoSelector).call(this, type));

    _this.value = value;
    return _this;
  }

  _createClass(PseudoSelector, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.value);
    }
  }]);

  return PseudoSelector;
}(_SimpleSelector3.default);

exports.default = PseudoSelector;

var PseudoClassSelector = exports.PseudoClassSelector = function (_PseudoSelector) {
  _inherits(PseudoClassSelector, _PseudoSelector);

  function PseudoClassSelector(body) {
    _classCallCheck(this, PseudoClassSelector);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PseudoClassSelector).call(this, 'PseudoClassSelector', body));
  }

  return PseudoClassSelector;
}(PseudoSelector);

var PseudoElementSelector = exports.PseudoElementSelector = function (_PseudoSelector2) {
  _inherits(PseudoElementSelector, _PseudoSelector2);

  function PseudoElementSelector(body) {
    _classCallCheck(this, PseudoElementSelector);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PseudoElementSelector).call(this, 'PseudoElementSelector', body));
  }

  return PseudoElementSelector;
}(PseudoSelector);

var CallExpression = exports.CallExpression = function (_Node) {
  _inherits(CallExpression, _Node);

  function CallExpression(callee) {
    var params = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, CallExpression);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(CallExpression).call(this, 'CallExpression'));

    _this4.callee = callee;
    _this4.params = params;
    return _this4;
  }

  _createClass(CallExpression, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.callee);
      this.params.forEach(function (param) {
        return traverser.visit(param);
      });
    }
  }]);

  return CallExpression;
}(_Node3.default);
