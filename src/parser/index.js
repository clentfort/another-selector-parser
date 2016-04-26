/* @flow */
import * as nodes from './nodes/';
import Tokenizer from '../tokenizer';

import getCombinatorFromToken from './util/getCombinatorFromToken';

import type { SimpleSelector } from './nodes/SimpleSelectorSequence';
import type { Token } from '../tokenizer/tokens';

export default class Parser {
  _tokenizer: Tokenizer;
  _currentToken: Token;

  constructor(tokenizer: Tokenizer) {
    this._tokenizer = tokenizer;
    this._nextToken();
  }

  parse(): nodes.SelectorsGroup {
    const selectorsGroup = new nodes.SelectorsGroup();
    while (this._currentToken.type !== 'EOF') {
      selectorsGroup.body.push(this._parseSelector());
    }
    return selectorsGroup;
  }

  _parseSelector(): nodes.Selector {
    const selector = new nodes.Selector();
    let parseSelector = true;
    while (
      this._currentToken.type !== 'EOF' &&
      this._currentToken.type !== 'comma'
    ) {
      if (parseSelector) {
        if (this._currentToken.type === 'whitespace') {
          this._nextToken();
          continue;
        }
        selector.body.push(this._parseSimpleSelectorSequence());
        if (
          this._currentToken.type === 'EOF' ||
          this._currentToken.type === 'comma'
        ) {
          this._nextToken();
          break;
        }
      } else {
        selector.body.push(this._parseCombinator());
        this._nextToken();
      }
      parseSelector = !parseSelector;
    }
    return selector;
  }

  _parseCombinator(): nodes.Combinator {
    if (this._currentToken.type === 'whitespace') {
      this._tokenizer.peek();
      const lookahead = this._tokenizer.nextToken();
      if (lookahead.type === 'combinator' || lookahead.type === 'plus') {
        this._tokenizer.skip();
        return getCombinatorFromToken(lookahead);
      }

      this._tokenizer.backup();
    }

    return getCombinatorFromToken(this._currentToken);
  }

  _parseSimpleSelectorSequence(): nodes.SimpleSelectorSequence {
    const simpleSelectorSequence = new nodes.SimpleSelectorSequence();

    simpleSelectorSequence.body.push(this._parseSimpleSelector1());
    this._nextToken();

    while (
      this._currentToken.type !== 'EOF' &&
      this._currentToken.type !== 'combinator' &&
      this._currentToken.type !== 'comma' &&
      this._currentToken.type !== 'plus' &&
      this._currentToken.type !== 'whitespace'
    ) {
      simpleSelectorSequence.body.push(this._parseSimpleSelector2());
      this._nextToken();
    }
    return simpleSelectorSequence;
  }

  _parseSimpleSelector1(): SimpleSelector {
    const namespacePrefix = this._parseNamespacePrefix();
    if (this._currentToken.type === 'ident') {
      return new nodes.TypeSelector(new nodes.Identifier(
        this._currentToken.value,
        namespacePrefix
      ));
    } else if (this._currentToken.type === 'star') {
      return new nodes.UniversalSelector(namespacePrefix);
    }
    return this._parseSimpleSelector2();
  }

  _parseSimpleSelector2(): SimpleSelector {
    let selector;
    switch (this._currentToken.type) {
      case 'bracketL':
        selector = this._parseAttributeSelector();
        break;
      case 'colon':
        selector = this._parsePseudoSelector();
        break;
      case 'dot':
        selector = this._parseClassSelector();
        break;
      case 'hash':
        selector = this._parseHashSelector();
        break;
      default:
        throw new Error();
    }
    return selector;
  }

  _parseNamespacePrefix(): ?nodes.NamespacePrefix {
    if (this._currentToken.type === 'pipe') {
      this._nextToken();
      return new nodes.NamespacePrefix();
    }

    let namespacePrefix;
    if (
      this._currentToken.type === 'ident' ||
      this._currentToken.type === 'star'
    ) {
      this._tokenizer.peek();
      const lookahead = this._tokenizer.nextToken();
      if (lookahead.type === 'pipe') {
        namespacePrefix = new nodes.NamespacePrefix(new nodes.Identifier(
          this._currentToken.type === 'ident' ? this._currentToken.value : '*'
        ));
        this._tokenizer.skip();
        this._nextToken();
      } else {
        this._tokenizer.backup();
      }
    }
    return namespacePrefix;
  }

  _parseAttributeSelector(): nodes.AttributeSelector {
    if (this._currentToken.type !== 'bracketL') {
      throw new Error();
    }
    this._nextToken();

    const namespacePrefix = this._parseNamespacePrefix();
    if (this._currentToken.type !== 'ident') {
      throw new Error();
    }
    const attribute = new nodes.AttributeSelectorAttribute(
      new nodes.Identifier(this._currentToken.value),
      namespacePrefix
    );
    this._nextToken();

    if (this._currentToken.type === 'bracketR') {
      return new nodes.AttributeSelector(attribute);
    } else if (this._currentToken.type !== 'matcher') {
      throw new Error();
    }
    const matcher = new nodes.AttributeSelectorMatcher(
      this._currentToken.value
    );
    this._nextToken();

    let value;
    if (this._currentToken.type === 'ident') {
      value = new nodes.AttributeSelectorValue(new nodes.Identifier(
        this._currentToken.value
      ));
    } else if (this._currentToken.type === 'string') {
      value = new nodes.AttributeSelectorValue(new nodes.StringLiteral(
        this._currentToken.value
      ));
    } else {
      throw new Error();
    }
    this._nextToken();

    if (this._currentToken.type !== 'bracketR') {
      throw new Error();
    }

    return new nodes.AttributeSelectorWithMatcher(
      attribute,
      matcher,
      value
    );
  }

  _parsePseudoSelector(): nodes.PseudoSelector {
    if (this._currentToken.type !== 'colon') {
      throw new Error();
    }
    this._nextToken();

    let pseudoSelectorType = 'PseudoClassSelector';
    if (this._currentToken.type === 'colon') {
      pseudoSelectorType = 'PseudoElementSelector';
      this._nextToken();
    }

    if (this._currentToken.type !== 'ident') {
      throw new Error();
    }

    let { value: name } = this._currentToken;
    let body = new nodes.Identifier(name);
    this._tokenizer.peek();
    const lookahead = this._tokenizer.nextToken();
    if (lookahead.type === 'parenL') {
      this._tokenizer.skip();
      body = new nodes.CallExpression(body);

      this._nextToken();
      let depth = 1;
      while (depth > 0) {
        if (this._currentToken.type === 'parenL') {
          ++depth;
        } else if (this._currentToken.type === 'parenR') {
          --depth;
        } else if (this._currentToken.type === 'EOF') {
          throw new Error('Unexpected EOF');
        }
        body.params.push(this._currentToken);
        this._nextToken();
      }
      this._nextToken();
    } else {
      this._tokenizer.backup();
    }

    return new nodes.PseudoSelector(pseudoSelectorType, body);
  }

  _parseClassSelector(): nodes.ClassSelector {
    if (this._currentToken.type !== 'dot') {
      throw new Error();
    }
    this._nextToken();

    if (this._currentToken.type !== 'ident') {
      throw new Error();
    }
    return new nodes.ClassSelector(new nodes.Identifier(
      this._currentToken.value
    ));
  }

  _parseHashSelector(): nodes.HashSelector {
    if (this._currentToken.type !== 'hash') {
      throw new Error();
    }
    this._nextToken();

    if (this._currentToken.type !== 'ident') {
      throw new Error();
    }
    return new nodes.HashSelector(new nodes.Identifier(
      this._currentToken.value
    ));
  }

  _nextToken(): void {
    this._currentToken = this._tokenizer.nextToken();
  }
}
