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

var Literal = function (_Node) {
  _inherits(Literal, _Node);

  function Literal() {
    var type = arguments.length <= 0 || arguments[0] === undefined ? 'Literal' : arguments[0];

    _classCallCheck(this, Literal);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Literal).call(this, type));
  }

  return Literal;
}(_Node3.default);

exports.default = Literal;
