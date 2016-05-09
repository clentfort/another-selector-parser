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

var Combinator = function (_Node) {
  _inherits(Combinator, _Node);

  function Combinator(combinatorType) {
    _classCallCheck(this, Combinator);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Combinator).call(this, 'Combinator'));

    _this.combinatorType = combinatorType;
    return _this;
  }

  return Combinator;
}(_Node3.default);

exports.default = Combinator;
