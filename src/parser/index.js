/* @flow */
import * as nodes from './nodes/';
import Tokenizer from '../tokenizer';
import NotExpressionParser from './plugins/NotExpressionParser';
import NthChildExpressionParser from './plugins/NthChildExpressionParser';
import Plugin from './plugins/Plugin';
import { UnexpectedTokenError, UnexpectedEofError } from './Errors';

import getCombinatorFromToken from './util/getCombinatorFromToken';

import type { Token } from '../tokenizer/tokens';

type PluginMap = {
  CallExpression: {
    [key: string]: Plugin;
  };
};

type ShouldStopAt = (token: Token) => boolean;

export default class Parser {
  _currentToken: Token;
  _plugins: PluginMap;
  _shouldStopAt: ShouldStopAt;
  _shouldStopAtStack: Array<ShouldStopAt>;
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
    this._shouldStopAtStack = [];
    this.pushShouldStopAt((token: Token): boolean => token.type === 'EOF');
  }

  getTokenizer(): Tokenizer {
    return this._tokenizer;
  }

  getCurrentToken(): Token {
    return this._currentToken;
  }

  nextToken(): Token {
    this._currentToken = Object.freeze(this._tokenizer.nextToken());
    return this._currentToken;
  }

  pushShouldStopAt(shouldStopAt: ShouldStopAt): void {
    this._shouldStopAtStack.push(shouldStopAt);
    this._shouldStopAt = shouldStopAt;
  }

  popShouldStopAt(): void {
    this._shouldStopAtStack.pop();
    this._shouldStopAt = this._shouldStopAtStack[
      this._shouldStopAtStack.length - 1
    ];
  }

  startNode<T: nodes.Node>(node: T): T {
    if (this._currentToken.loc) {
      node.loc = this._currentToken.loc;
    }
    return node;
  }

  finishNode<T: nodes.Node>(node: T, start: ?Token): T {
    if (start && start.loc && (!node.loc || !node.loc.start)) {
      node.loc = start.loc.clone();
    }
    if (node.loc && this._currentToken.loc) {
      // $FlowFixMe
      node.loc.end = this._currentToken.loc.end.clone();
    }
    return node;
  }

  parse(): nodes.SelectorsGroup {
    return this.parseSelectorsGroup();
  }

  parseSelectorsGroup(): nodes.SelectorsGroup {
    const selectorsGroup = this.startNode(new nodes.SelectorsGroup());
    while (!this._shouldStopAt(this._currentToken)) {
      selectorsGroup.body.push(this.parseSelector());
      if (!this._shouldStopAt(this._currentToken)) {
        this.nextToken();
      }
    }
    return this.finishNode(selectorsGroup);
  }

  parseSelector(): nodes.Selector {
    const selector = this.startNode(new nodes.Selector());
    let parseSelector = true;
    while (
      this._currentToken.type !== 'comma' &&
      !this._shouldStopAt(this._currentToken)
    ) {
      if (parseSelector) {
        if (this._currentToken.type === 'whitespace') {
          this.nextToken();
          continue;
        }
        selector.body.push(this.parseSimpleSelectorSequence());
      } else {
        selector.body.push(this.parseCombinator());
        this.nextToken();
      }
      parseSelector = !parseSelector;
    }
    return this.finishNode(selector);
  }

  parseCombinator(): nodes.Combinator {
    const start = this._currentToken;
    if (this._currentToken.type === 'whitespace') {
      this._tokenizer.peek();
      const lookahead = this._tokenizer.nextToken();
      if (lookahead.type === 'combinator' || lookahead.type === 'plus') {
        this._tokenizer.skip();
        return this.finishNode(getCombinatorFromToken(lookahead), start);
      }

      this._tokenizer.backup();
    }

    return this.finishNode(getCombinatorFromToken(this._currentToken), start);
  }

  parseSimpleSelectorSequence(): nodes.SimpleSelectorSequence {
    const simpleSelectorSequence = this.startNode(new nodes.SimpleSelectorSequence());

    simpleSelectorSequence.body.push(this.parseSimpleSelector1());
    this.nextToken();

    while (
      this._currentToken.type !== 'combinator' &&
      this._currentToken.type !== 'comma' &&
      this._currentToken.type !== 'plus' &&
      this._currentToken.type !== 'whitespace' &&
      !this._shouldStopAt(this._currentToken)
    ) {
      simpleSelectorSequence.body.push(this.parseSimpleSelector2());
      this.nextToken();
    }
    return this.finishNode(simpleSelectorSequence);
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
    this._tokenizer.emitWhitespace(false);
    this.nextToken();

    const namespacePrefix = this.parseNamespacePrefix();
    if (this._currentToken.type !== 'ident') {
      throw new UnexpectedTokenError(this._currentToken, 'ident');
    }
    const attribute = this.finishNode(new nodes.AttributeSelectorAttribute(
      this.parseIdentifier(),
      namespacePrefix,
    ), this._currentToken);
    this.nextToken();

    if (this._currentToken.type === 'bracketR') {
      this._tokenizer.emitWhitespace(true);
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
    this.nextToken();

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
    this._tokenizer.emitWhitespace(true);
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
    this._tokenizer.peek();
    const lookahead = this._tokenizer.nextToken();
    if (lookahead.type === 'parenL') {
      this._tokenizer.skip();
      body = this.startNode(new nodes.CallExpression(body));
      this.nextToken();

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
    } else {
      this._tokenizer.backup();
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

    return this.finishNode(new nodes.Identifier(
      this._currentToken.value
    ), this._currentToken);
  }

  parseStringLiteral(): nodes.StringLiteral {
    if (this._currentToken.type !== 'string') {
      throw new UnexpectedTokenError(this._currentToken, 'string');
    }

    return this.finishNode(new nodes.StringLiteral(
      this._currentToken.value
    ), this._currentToken);
  }

}
