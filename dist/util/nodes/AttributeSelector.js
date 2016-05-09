'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttributeSelectorValue = exports.AttributeSelectorMatcher = exports.AttributeSelectorAttribute = exports.AttributeSelectorWithMatcher = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Node4 = require('./Node');

var _Node5 = _interopRequireDefault(_Node4);

var _SimpleSelector2 = require('./SimpleSelector');

var _SimpleSelector3 = _interopRequireDefault(_SimpleSelector2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// @TODO Generalize with tokenizer

var AttributeSelector = function (_SimpleSelector) {
  _inherits(AttributeSelector, _SimpleSelector);

  function AttributeSelector(attribute) {
    _classCallCheck(this, AttributeSelector);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AttributeSelector).call(this, 'AttributeSelector'));

    _this.attribute = attribute;
    return _this;
  }

  _createClass(AttributeSelector, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.attribute);
    }
  }]);

  return AttributeSelector;
}(_SimpleSelector3.default);

exports.default = AttributeSelector;

var AttributeSelectorWithMatcher = exports.AttributeSelectorWithMatcher = function (_AttributeSelector) {
  _inherits(AttributeSelectorWithMatcher, _AttributeSelector);

  function AttributeSelectorWithMatcher(attribute, matcher, value, caseSensitive) {
    _classCallCheck(this, AttributeSelectorWithMatcher);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(AttributeSelectorWithMatcher).call(this, attribute));

    _this2.matcher = matcher;
    _this2.value = value;
    _this2.caseSensitive = caseSensitive;
    return _this2;
  }

  _createClass(AttributeSelectorWithMatcher, [{
    key: 'accept',
    value: function accept(traverser) {
      _get(Object.getPrototypeOf(AttributeSelectorWithMatcher.prototype), 'accept', this).call(this, traverser);
      traverser.visit(this.matcher);
      traverser.visit(this.value);
    }
  }]);

  return AttributeSelectorWithMatcher;
}(AttributeSelector);

var AttributeSelectorAttribute = exports.AttributeSelectorAttribute = function (_Node) {
  _inherits(AttributeSelectorAttribute, _Node);

  function AttributeSelectorAttribute(value, namespacePrefix) {
    _classCallCheck(this, AttributeSelectorAttribute);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(AttributeSelectorAttribute).call(this, 'AttributeSelectorAttribute'));

    _this3.namespacePrefix = namespacePrefix;
    _this3.value = value;
    return _this3;
  }

  _createClass(AttributeSelectorAttribute, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.value);
      if (this.namespacePrefix) {
        traverser.visit(this.namespacePrefix);
      }
    }
  }]);

  return AttributeSelectorAttribute;
}(_Node5.default);

var AttributeSelectorMatcher = exports.AttributeSelectorMatcher = function (_Node2) {
  _inherits(AttributeSelectorMatcher, _Node2);

  function AttributeSelectorMatcher(value) {
    _classCallCheck(this, AttributeSelectorMatcher);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(AttributeSelectorMatcher).call(this, 'AttributeSelectorMatcher'));

    _this4.value = value;
    return _this4;
  }

  return AttributeSelectorMatcher;
}(_Node5.default);

var AttributeSelectorValue = exports.AttributeSelectorValue = function (_Node3) {
  _inherits(AttributeSelectorValue, _Node3);

  function AttributeSelectorValue(value) {
    _classCallCheck(this, AttributeSelectorValue);

    var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(AttributeSelectorValue).call(this, 'AttributeSelectorValue'));

    _this5.value = value;
    return _this5;
  }

  _createClass(AttributeSelectorValue, [{
    key: 'accept',
    value: function accept(traverser) {
      traverser.visit(this.value);
    }
  }]);

  return AttributeSelectorValue;
}(_Node5.default);
