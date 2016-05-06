/* @flow */
import * as nodes from './nodes/';
import Tokenizer from '../tokenizer';
import NotExpressionParser from './plugins/NotExpressionParser';
import NthChildExpressionParser from './plugins/NthChildExpressionParser';
import Plugin from './plugins/Plugin';
import {
  InvalidContextError,
  UnexpectedTokenError,
  UnexpectedEofError,
  UnfinishedSelectorError,
} from './util/Errors';

import getCombinatorTypeFromToken from './util/getCombinatorTypeFromToken';

import type { Token } from '../tokenizer/tokens';

type PluginMap = {
  CallExpression: {
    [key: string]: Plugin;
  };
};

type ShouldStopAt = (token: Token) => boolean;
type Context = {
  [key: string]: any;
  emitWhitespace: boolean;
  name: string;
  shouldStopAt: ShouldStopAt;
};
type PartialContext = {
  [key: string]: any;
  name: string;
};

const defaultContext = {
  name: 'AnotherSelectorParserParser',
  emitWhitespace: true,
  shouldStopAt: (token: Token): boolean => token.type === 'EOF',
};

export default class Parser {
  _currentToken: Token;
  _plugins: PluginMap;
  _contextStack: Array<Context>;
  _tokenizer: Tokenizer;

  constructor(tokenizer: Tokenizer) {
    this._tokenizer = tokenizer;
    this.nextToken();
    this._plugins = {
      CallExpression: {
        not: new NotExpressionParser(this),
        'nth-child': new NthChildExpressionParser(this),
      },
    };
    this._contextStack = [defaultContext];
  }

  getCurrentToken(): Token {
    return this._currentToken;
  }

  nextToken(): Token {
    this._currentToken = Object.freeze(this._tokenizer.nextToken());
    return this._currentToken;
  }

  getCurrentContext(): Context {
    return this._contextStack[this._contextStack.length - 1];
  }

  pushContext(context: PartialContext): void {
    // console.log('New context', context.name);
    const newContext = { ...this.getCurrentContext(), ...context };
    this._contextStack.push(newContext);
    this._setContext(newContext);
  }

  popContext(name: string): void {
    // console.log('Leaving context', name);
    if (this.getCurrentContext().name !== name) {
      throw new Invalid(name, this.getCurrentContext().name);
    }
    this._contextStack.pop();
    this._setContext(this.getCurrentContext());
  }

  // $FlowIssue #1234
  startNode<T: nodes.Node>(node: T, start: Token = this._currentToken): T {
    if (start.loc) {
      node.loc = start.loc.clone();
    }
    return node;
  }

  finishNode<T: nodes.Node>(node: T, start: ?Token): T {
    if (start) {
      this.startNode(node, start);
    }
    if (node.loc && this._currentToken.loc) {
      // $FlowIssue #1747
      node.loc.end = this._currentToken.loc.end.clone();
    }
    return node;
  }

  parse(): nodes.SelectorList {
    return this.parseSelectorList();
  }

  parseSelectorList(): nodes.SelectorList {
    const selectorList = this.startNode(new nodes.SelectorList());
    while (!this.getCurrentContext().shouldStopAt(this._currentToken)) {
      selectorList.body.push(this.parseSelector());
    }
    return this.finishNode(selectorList);
  }

  parseSelector(): nodes.Selector {
    const selector = this.startNode(new nodes.Selector());
    let parseSelector = true;
    while (
      this._currentToken.type !== 'comma' &&
      !this.getCurrentContext().shouldStopAt(this._currentToken)
    ) {
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
      throw new UnfinishedSelectorError();
    }
    return this.finishNode(selector);
  }

  parseCombinator(): nodes.Combinator {
    if (
      this._currentToken.type !== 'combinator' &&
      this._currentToken.type !== 'plus' &&
      this._currentToken.type !== 'whitespace'
    ) {
      throw new UnexpectedTokenError(
        this._currentToken,
        ['combinator', 'plus', 'whitespace']
      );
    }
    let start = this._currentToken;
    this.nextToken();
    if (
      start.type === 'whitespace' &&
      (
        this._currentToken.type === 'combinator' ||
        this._currentToken.type === 'plus'
      )
    ) {
      start = this._currentToken;
      this.nextToken();
    }
    return this.finishNode(new nodes.Combinator(
      getCombinatorTypeFromToken(start)
    ), start);
  }

  parseSimpleSelectorList(): nodes.SimpleSelectorList {
    const simpleSelectorList = this.startNode(new nodes.SimpleSelectorList());

    simpleSelectorList.body.push(this.parseSimpleSelector1());

    while (
      this._currentToken.type !== 'combinator' &&
      this._currentToken.type !== 'comma' &&
      this._currentToken.type !== 'plus' &&
      this._currentToken.type !== 'whitespace' &&
      !this.getCurrentContext().shouldStopAt(this._currentToken)
    ) {
      simpleSelectorList.body.push(this.parseSimpleSelector2());
    }
    return this.finishNode(simpleSelectorList);
  }

  parseSimpleSelector1(): nodes.SimpleSelector {
    const start = this._currentToken;
    const namespacePrefix = this.parseNamespacePrefix();
    if (this._currentToken.type === 'ident') {
      return this.finishNode(new nodes.TypeSelector(
        this.parseIdentifier(),
        namespacePrefix
      ), start);
    } else if (this._currentToken.type === 'star') {
      this.nextToken();
      return this.finishNode(
        new nodes.UniversalSelector(namespacePrefix),
        start
      );
    }
    return this.parseSimpleSelector2();
  }

  parseSimpleSelector2(): nodes.SimpleSelector {
    let selector;
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
        throw new UnexpectedTokenError(this._currentToken, ['bracketL', 'colon', 'dot', 'hash']);
    }
    return selector;
  }

  parseNamespacePrefix(): ?nodes.NamespacePrefix {
    const start = this._currentToken;
    if (this._currentToken.type === 'pipe') {
      this.nextToken();
      return this.finishNode(new nodes.NamespacePrefix(), start);
    }

    let namespacePrefix;
    if (
      this._currentToken.type === 'ident' ||
      this._currentToken.type === 'star'
    ) {
      this._tokenizer.peek();
      const lookahead = this._tokenizer.nextToken();
      if (lookahead.type === 'pipe') {
        const prefix = this.finishNode(new nodes.Identifier(
          this._currentToken.type === 'ident' ? this._currentToken.value : '*'
        ), start);
        // @TODO Maybe wrap skip in a parser internal method so we dont have to
        // reassign `_currentToken`
        this._tokenizer.skip();
        this._currentToken = lookahead;
        namespacePrefix = this.finishNode(
          new nodes.NamespacePrefix(prefix),
          start,
        );
        this.nextToken();
      } else {
        this._tokenizer.backup();
      }
    }
    return namespacePrefix;
  }

  parseAttributeSelector(): nodes.AttributeSelector {
    const start = this._currentToken;
    if (this._currentToken.type !== 'bracketL') {
      throw new UnexpectedTokenError(this._currentToken, 'bracketL');
    }
    this.pushContext({
      name: 'AnotherSelectorParserParser.parseAttributeSelector',
      emitWhitespace: false,
    });
    this.nextToken();

    const namespacePrefix = this.parseNamespacePrefix();
    if (this._currentToken.type !== 'ident') {
      throw new UnexpectedTokenError(this._currentToken, 'ident');
    }
    const attribute = this.finishNode(new nodes.AttributeSelectorAttribute(
      this.parseIdentifier(),
      namespacePrefix,
    ), this._currentToken);

    if (this._currentToken.type === 'bracketR') {
      this.nextToken();
      this.popContext('AnotherSelectorParserParser.parseAttributeSelector');
      return this.finishNode(new nodes.AttributeSelector(attribute), start);
    } else if (this._currentToken.type !== 'matcher') {
      throw new UnexpectedTokenError(this._currentToken, 'matcher');
    }
    const matcher = this.finishNode(new nodes.AttributeSelectorMatcher(
      this._currentToken.value
    ), this._currentToken);
    this.nextToken();

    let value;
    if (this._currentToken.type === 'ident') {
      value = new nodes.AttributeSelectorValue(this.parseIdentifier());
    } else if (this._currentToken.type === 'string') {
      value = new nodes.AttributeSelectorValue(this.parseStringLiteral());
    } else {
      throw new UnexpectedTokenError(this._currentToken, ['ident', 'string']);
    }
    value = this.finishNode(value, this._currentToken);

    let caseSensitive = true;
    if (this._currentToken.type === 'ident') {
      if (this._currentToken.value.toLowerCase() !== 'i') {
        throw new UnexpectedTokenError(this._currentToken, 'ident', 'i');
      }
      caseSensitive = false;
      this.nextToken();
    }

    if (this._currentToken.type !== 'bracketR') {
      throw new UnexpectedTokenError(this._currentToken, 'bracketR');
    }
    this.nextToken();
    this.popContext('AnotherSelectorParserParser.parseAttributeSelector');
    return this.finishNode(new nodes.AttributeSelectorWithMatcher(
      attribute,
      matcher,
      value,
      caseSensitive,
    ), start);
  }

  parsePseudoSelector(): nodes.PseudoSelector {
    const start = this._currentToken;
    if (this._currentToken.type !== 'colon') {
      throw new UnexpectedTokenError(this._currentToken, 'colon');
    }
    this.nextToken();

    let pseudoSelectorType = 'PseudoClassSelector';
    if (this._currentToken.type === 'colon') {
      pseudoSelectorType = 'PseudoElementSelector';
      this.nextToken();
    }

    if (this._currentToken.type !== 'ident') {
      throw new UnexpectedTokenError(this._currentToken, 'ident');
    }

    const { value: name } = this._currentToken;
    let body = this.parseIdentifier();
    if (this._currentToken.type === 'parenL') {
      this.nextToken();

      body = this.startNode(new nodes.CallExpression(body));
      const plugin = this._plugins.CallExpression[name.toLowerCase()];

      if (plugin) {
        body.params = plugin.parse();
      } else {
        let depth = 1;
        while (depth > 0) {
          if (this._currentToken.type === 'parenL') {
            ++depth;
          } else if (this._currentToken.type === 'parenR') {
            --depth;
          } else if (this._currentToken.type === 'EOF') {
            throw new UnexpectedEofError(this._currentToken);
          }
          body.params.push(this._currentToken);
          this.nextToken();
        }
      }
      body = this.finishNode(body);
    }

    return this.finishNode(
      new nodes.PseudoSelector(pseudoSelectorType, body),
      start
    );
  }

  parseClassSelector(): nodes.ClassSelector {
    const dotStart = this._currentToken;
    if (this._currentToken.type !== 'dot') {
      throw new UnexpectedTokenError(this._currentToken, 'dot');
    }
    this.nextToken();

    return this.finishNode(new nodes.ClassSelector(
      this.parseIdentifier()
    ), dotStart);
  }

  parseHashSelector(): nodes.HashSelector {
    const hashStart = this._currentToken;
    if (this._currentToken.type !== 'hash') {
      throw new UnexpectedTokenError(this._currentToken, 'hash');
    }
    this.nextToken();

    return this.finishNode(new nodes.HashSelector(
      this.parseIdentifier()
    ), hashStart);
  }

  parseIdentifier(): nodes.Identifier {
    if (this._currentToken.type !== 'ident') {
      throw new UnexpectedTokenError(this._currentToken, 'ident');
    }

    const node = this.finishNode(new nodes.Identifier(
      this._currentToken.value
    ), this._currentToken);
    this.nextToken();
    return node;
  }

  parseStringLiteral(): nodes.StringLiteral {
    if (this._currentToken.type !== 'string') {
      throw new UnexpectedTokenError(this._currentToken, 'string');
    }
    const node = this.finishNode(new nodes.StringLiteral(
      this._currentToken.value
    ), this._currentToken);
    this.nextToken();
    return node;
  }

  parseNumberLiteral(): nodes.NumberLiteral {
    if (this._currentToken.type !== 'num') {
      throw new UnexpectedTokenError(this._currentToken, 'num');
    }

    const node = this.finishNode(new nodes.NumberLiteral(
      this._currentToken.value
    ), this._currentToken);
    this.nextToken();
    return node;
  }

  _setContext(context: Context): void {
    this._tokenizer.emitWhitespace(context.emitWhitespace);
  }
}
