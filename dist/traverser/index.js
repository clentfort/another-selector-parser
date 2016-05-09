'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultTraverser = undefined;

var _Traverser2 = require('./Traverser');

var _Traverser3 = _interopRequireDefault(_Traverser2);

var _NotExpressionParser = require('../plugins/NotExpressionParser');

var _NotExpressionParser2 = _interopRequireDefault(_NotExpressionParser);

var _NthChildExpressionParser = require('../plugins/NthChildExpressionParser');

var _NthChildExpressionParser2 = _interopRequireDefault(_NthChildExpressionParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DefaultTraverser = exports.DefaultTraverser = _Traverser3.default;

var _class = function (_Traverser) {
  _inherits(_class, _Traverser);

  function _class() {
    var _Object$getPrototypeO;

    _classCallCheck(this, _class);

    for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
      params[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(_class)).call.apply(_Object$getPrototypeO, [this].concat(params)));

    _this.setPlugin(_NotExpressionParser2.default);
    _this.setPlugin(_NthChildExpressionParser2.default);
    return _this;
  }

  return _class;
}(_Traverser3.default);

exports.default = _class;
