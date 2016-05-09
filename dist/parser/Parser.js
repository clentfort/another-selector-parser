'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Errors = require('./util/Errors');

var _nodes = require('../util/nodes/');

var nodes = _interopRequireWildcard(_nodes);

var _getCombinatorTypeFromToken = require('./util/getCombinatorTypeFromToken');

var _getCombinatorTypeFromToken2 = _interopRequireDefault(_getCombinatorTypeFromToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultContext = {
  name: 'AnotherSelectorParserParser',
  emitWhitespace: true,
  shouldStopAt: function shouldStopAt(token) {
    return token.type === 'EOF';
  }
};

var Parser = function () {
  function Parser(tokenizer) {
    _classCallCheck(this, Parser);

    this._tokenizer = tokenizer;
    this.nextToken();
    this._plugins = {};
    this._contextStack = [defaultContext];
  }

  _createClass(Parser, [{
    key: 'getCurrentToken',
    value: function getCurrentToken() {
      return this._currentToken;
    }
  }, {
    key: 'nextToken',
    value: function nextToken() {
      this._currentToken = Object.freeze(this._tokenizer.nextToken());
      return this._currentToken;
    }
  }, {
    key: 'getCurrentContext',
    value: function getCurrentContext() {
      return this._contextStack[this._contextStack.length - 1];
    }
  }, {
    key: 'pushContext',
    value: function pushContext(context) {
      var newContext = _extends({}, this.getCurrentContext(), context);
      this._contextStack.push(newContext);
      this._setContext(newContext);
    }
  }, {
    key: 'popContext',
    value: function popContext(name) {
      if (this.getCurrentContext().name !== name) {
        throw new _Errors.InvalidContextError(name, this.getCurrentContext().name);
      }
      this._contextStack.pop();
      this._setContext(this.getCurrentContext());
    }
  }, {
    key: 'setPlugin',
    value: function setPlugin(plugin) {
      var targetNode = plugin.getTargetNode();
      var targetExpression = plugin.getTargetExpression();
      if (!this._plugins[targetNode]) {
        this._plugins[targetNode] = {};
      }
      /* eslint-disable new-cap */
      this._plugins[targetNode][targetExpression] = new plugin(this);
      /* eslint-enable new-cap */
    }

    // $FlowIssue #1234

  }, {
    key: 'startNode',
    value: function startNode(node) {
      var start = arguments.length <= 1 || arguments[1] === undefined ? this._currentToken : arguments[1];

      if (start.loc) {
        node.loc = start.loc.clone();
      }
      return node;
    }
  }, {
    key: 'finishNode',
    value: function finishNode(node) {
      var
      // $FlowIssue #1234
      copyEndFrom = arguments.length <= 1 || arguments[1] === undefined ? this._currentToken : arguments[1];
      var copyStartFrom = arguments[2];

      if (copyStartFrom) {
        this.startNode(node, copyStartFrom);
      }
      if (node.loc && copyEndFrom.loc) {
        // $FlowIssue #1747
        node.loc.end = copyEndFrom.loc.end.clone();
      }
      return node;
    }
  }, {
    key: 'parse',
    value: function parse() {
      return this.parseSelectorList();
    }
  }, {
    key: 'parseSelectorList',
    value: function parseSelectorList() {
      var selectorList = this.startNode(new nodes.SelectorList());
      while (!this.getCurrentContext().shouldStopAt(this._currentToken)) {
        selectorList.body.push(this.parseSelector());
      }
      return this.finishNode(selectorList, selectorList.body[selectorList.body.length - 1]);
    }
  }, {
    key: 'parseSelector',
    value: function parseSelector() {
      var selector = this.startNode(new nodes.Selector());
      var parseSelector = true;
      while (this._currentToken.type !== 'comma' && !this.getCurrentContext().shouldStopAt(this._currentToken)) {
        if (parseSelector) {
          if (this._currentToken.type === 'whitespace') {
            this.nextToken();
          } else {
            selector.body.push(this.parseSimpleSelectorList());
            parseSelector = false;
          }
        } else {
          selector.body.push(this.parseCombinator());
          parseSelector = true;
        }
      }

      if (!this.getCurrentContext().shouldStopAt(this._currentToken)) {
        this.nextToken();
      }

      if (parseSelector) {
        // Can't finish with a combinator
        throw new _Errors.UnfinishedSelectorError();
      }
      return this.finishNode(selector, selector.body[selector.body.length - 1]);
    }
  }, {
    key: 'parseCombinator',
    value: function parseCombinator() {
      if (this._currentToken.type !== 'combinator' && this._currentToken.type !== 'plus' && this._currentToken.type !== 'whitespace') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, ['combinator', 'plus', 'whitespace']);
      }
      var start = this._currentToken;
      this.nextToken();
      if (start.type === 'whitespace' && (this._currentToken.type === 'combinator' || this._currentToken.type === 'plus')) {
        start = this._currentToken;
        this.nextToken();
      }
      return this.finishNode(new nodes.Combinator((0, _getCombinatorTypeFromToken2.default)(start)), start, start);
    }
  }, {
    key: 'parseSimpleSelectorList',
    value: function parseSimpleSelectorList() {
      var simpleSelectorList = this.startNode(new nodes.SimpleSelectorList());

      simpleSelectorList.body.push(this.parseSimpleSelector1());

      while (this._currentToken.type !== 'combinator' && this._currentToken.type !== 'comma' && this._currentToken.type !== 'plus' && this._currentToken.type !== 'whitespace' && !this.getCurrentContext().shouldStopAt(this._currentToken)) {
        simpleSelectorList.body.push(this.parseSimpleSelector2());
      }
      return this.finishNode(simpleSelectorList, simpleSelectorList.body[simpleSelectorList.body.length - 1]);
    }
  }, {
    key: 'parseSimpleSelector1',
    value: function parseSimpleSelector1() {
      var start = this._currentToken;
      var namespacePrefix = this.parseNamespacePrefix();
      if (this._currentToken.type === 'ident') {
        return this.finishNode(new nodes.TypeSelector(this.parseIdentifier(), namespacePrefix), start, start);
      } else if (this._currentToken.type === 'star') {
        this.nextToken();
        return this.finishNode(new nodes.UniversalSelector(namespacePrefix), start, start);
      }
      return this.parseSimpleSelector2();
    }
  }, {
    key: 'parseSimpleSelector2',
    value: function parseSimpleSelector2() {
      var selector = void 0;
      switch (this._currentToken.type) {
        case 'bracketL':
          selector = this.parseAttributeSelector();
          break;
        case 'colon':
          selector = this.parsePseudoSelector();
          break;
        case 'dot':
          selector = this.parseClassSelector();
          break;
        case 'hash':
          selector = this.parseHashSelector();
          break;
        default:
          throw new _Errors.UnexpectedTokenError(this._currentToken, ['bracketL', 'colon', 'dot', 'hash']);
      }
      return selector;
    }
  }, {
    key: 'parseNamespacePrefix',
    value: function parseNamespacePrefix() {
      var start = this._currentToken;
      if (this._currentToken.type === 'pipe') {
        this.nextToken();
        return this.finishNode(new nodes.NamespacePrefix(), start, start);
      }

      var namespacePrefix = void 0;
      if (this._currentToken.type === 'ident' || this._currentToken.type === 'star') {
        this._tokenizer.peek();
        var lookahead = this._tokenizer.nextToken();
        if (lookahead.type === 'pipe') {
          var prefix = this.finishNode(new nodes.Identifier(this._currentToken.type === 'ident' ? this._currentToken.value : '*'), this._currentToken, start);
          // @TODO Maybe wrap skip in a parser internal method so we dont have to
          // reassign `_currentToken`
          this._tokenizer.skip();
          namespacePrefix = this.finishNode(new nodes.NamespacePrefix(prefix), prefix, start);
          this.nextToken();
        } else {
          this._tokenizer.backup();
        }
      }
      return namespacePrefix;
    }
  }, {
    key: 'parseAttributeSelector',
    value: function parseAttributeSelector() {
      if (this._currentToken.type !== 'bracketL') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'bracketL');
      }
      this.pushContext({
        name: 'AnotherSelectorParserParser.parseAttributeSelector',
        emitWhitespace: false
      });

      var selectorStart = this._currentToken;
      var attributeStart = this.nextToken();
      var namespacePrefix = this.parseNamespacePrefix();
      if (this._currentToken.type !== 'ident') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'ident');
      }
      var attributeValue = this.parseIdentifier();
      var attribute = this.finishNode(new nodes.AttributeSelectorAttribute(attributeValue, namespacePrefix), attributeValue, attributeStart);

      if (this._currentToken.type === 'bracketR') {
        var _selectorEnd = this.nextToken();
        this.popContext('AnotherSelectorParserParser.parseAttributeSelector');
        return this.finishNode(new nodes.AttributeSelector(attribute), _selectorEnd, selectorStart);
      } else if (this._currentToken.type !== 'matcher') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'matcher');
      }
      var matcher = this.finishNode(new nodes.AttributeSelectorMatcher(this._currentToken.value), this._currentToken, this._currentToken);
      var valueToken = this.nextToken();

      var value = void 0;
      if (valueToken.type === 'ident') {
        value = this.parseIdentifier();
      } else if (valueToken.type === 'string') {
        value = this.parseStringLiteral();
      } else {
        throw new _Errors.UnexpectedTokenError(this._currentToken, ['ident', 'string']);
      }
      value = this.finishNode(new nodes.AttributeSelectorValue(value), value, value);

      var caseSensitive = true;
      if (this._currentToken.type === 'ident') {
        if (this._currentToken.value.toLowerCase() !== 'i') {
          throw new _Errors.UnexpectedTokenError(this._currentToken, 'ident', 'i');
        }
        caseSensitive = false;
        this.nextToken();
      }

      if (this._currentToken.type !== 'bracketR') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'bracketR');
      }
      var selectorEnd = this.nextToken();

      this.popContext('AnotherSelectorParserParser.parseAttributeSelector');
      return this.finishNode(new nodes.AttributeSelectorWithMatcher(attribute, matcher, value, caseSensitive), selectorEnd, selectorStart);
    }
  }, {
    key: 'parsePseudoSelector',
    value: function parsePseudoSelector() {
      if (this._currentToken.type !== 'colon') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'colon');
      }
      var selectorStart = this._currentToken;
      this.nextToken();

      var pseudoSelectorType = 'PseudoClassSelector';
      if (this._currentToken.type === 'colon') {
        pseudoSelectorType = 'PseudoElementSelector';
        this.nextToken();
      }

      if (this._currentToken.type !== 'ident') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'ident');
      }

      var name = this._currentToken.value;

      var body = this.parseIdentifier();
      if (this._currentToken.type === 'parenL') {
        this.nextToken();

        body = this.startNode(new nodes.CallExpression(body));
        var plugin = this._plugins.CallExpression[name.toLowerCase()];

        if (plugin) {
          body.params = plugin.parse();
        } else {
          var depth = 1;
          while (depth > 0) {
            if (this._currentToken.type === 'parenL') {
              ++depth;
            } else if (this._currentToken.type === 'parenR') {
              --depth;
            } else if (this._currentToken.type === 'EOF') {
              throw new _Errors.UnexpectedEofError(this._currentToken);
            }
            body.params.push(this._currentToken);
            this.nextToken();
          }
        }
        body = this.finishNode(body);
      }

      return this.finishNode(new nodes.PseudoSelector(pseudoSelectorType, body), body, selectorStart);
    }
  }, {
    key: 'parseClassSelector',
    value: function parseClassSelector() {
      var dotStart = this._currentToken;
      if (this._currentToken.type !== 'dot') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'dot');
      }
      var nameToken = this.nextToken();

      return this.finishNode(new nodes.ClassSelector(this.parseIdentifier()), nameToken, dotStart);
    }
  }, {
    key: 'parseHashSelector',
    value: function parseHashSelector() {
      var hashStart = this._currentToken;
      if (this._currentToken.type !== 'hash') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'hash');
      }
      var nameToken = this.nextToken();

      return this.finishNode(new nodes.HashSelector(this.parseIdentifier()), nameToken, hashStart);
    }
  }, {
    key: 'parseIdentifier',
    value: function parseIdentifier() {
      if (this._currentToken.type !== 'ident') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'ident');
      }

      var node = this.finishNode(new nodes.Identifier(this._currentToken.value), this._currentToken, this._currentToken);
      this.nextToken();
      return node;
    }
  }, {
    key: 'parseStringLiteral',
    value: function parseStringLiteral() {
      if (this._currentToken.type !== 'string') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'string');
      }
      var node = this.finishNode(new nodes.StringLiteral(this._currentToken.value), this._currentToken, this._currentToken);
      this.nextToken();
      return node;
    }
  }, {
    key: 'parseNumberLiteral',
    value: function parseNumberLiteral() {
      if (this._currentToken.type !== 'num') {
        throw new _Errors.UnexpectedTokenError(this._currentToken, 'num');
      }

      var node = this.finishNode(new nodes.NumberLiteral(this._currentToken.value), this._currentToken, this._currentToken);
      this.nextToken();
      return node;
    }
  }, {
    key: '_setContext',
    value: function _setContext(context) {
      this._tokenizer.emitWhitespace(context.emitWhitespace);
    }
  }]);

  return Parser;
}();

exports.default = Parser;
