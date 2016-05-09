'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnknownCombinatorTypeValue = undefined;
exports.default = getCombinatorTypeFromToken;

var _Error = require('../../util/Error');

var _Error2 = _interopRequireDefault(_Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnknownCombinatorTypeValue = exports.UnknownCombinatorTypeValue = function (_AnotherSelectorParse) {
  _inherits(UnknownCombinatorTypeValue, _AnotherSelectorParse);

  function UnknownCombinatorTypeValue() {
    _classCallCheck(this, UnknownCombinatorTypeValue);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(UnknownCombinatorTypeValue).call(this, 'Encountered unknown combinator type'));
  }

  return UnknownCombinatorTypeValue;
}(_Error2.default);

function getCombinatorTypeFromToken(token) {
  if (token.type === 'plus') {
    return 'sibling-next';
  } else if (token.type === 'whitespace') {
    return 'descendant';
  } else if (token.type === 'combinator') {
    if (token.value === '~') {
      return 'sibling-following';
    } else if (token.value === '>') {
      return 'child';
    } else if (token.value === '>>') {
      return 'descendant';
    }
  }
  throw new UnknownCombinatorTypeValue();
}
