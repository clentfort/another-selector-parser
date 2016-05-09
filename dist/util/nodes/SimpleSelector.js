'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Node2 = require('./Node');

var _Node3 = _interopRequireDefault(_Node2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SimpleSelector = function (_Node) {
  _inherits(SimpleSelector, _Node);

  function SimpleSelector() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? 'SimpleSelector' : arguments[0];

    _classCallCheck(this, SimpleSelector);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(SimpleSelector).call(this, type));
  }

  return SimpleSelector;
}(_Node3.default);

exports.default = SimpleSelector;
