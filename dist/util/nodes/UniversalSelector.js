'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SimpleSelector2 = require('./SimpleSelector');

var _SimpleSelector3 = _interopRequireDefault(_SimpleSelector2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UniversalSelector = function (_SimpleSelector) {
  _inherits(UniversalSelector, _SimpleSelector);

  function UniversalSelector(namespacePrefix) {
    _classCallCheck(this, UniversalSelector);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UniversalSelector).call(this, 'UniversalSelector'));

    _this.namespacePrefix = namespacePrefix;
    return _this;
  }

  _createClass(UniversalSelector, [{
    key: 'accept',
    value: function accept(traverser) {
      if (this.namespacePrefix) {
        traverser.visit(this.namespacePrefix);
      }
    }
  }]);

  return UniversalSelector;
}(_SimpleSelector3.default);

exports.default = UniversalSelector;
