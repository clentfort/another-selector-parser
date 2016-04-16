/* @flow */
import {
  UnexpectedTokenError,
  UnexpectedTopNodeError,
} from './Errors';
import tokenize from '../tokenizer';
import { types as tt } from '../tokenizer/types';

import type { Token } from '../tokenizer';
import type { TokenType } from '../tokenizer/types';

type Node = {
  type: NodeType;
  [key: string]: any;
};
export type NodeType = string;

type ParseToken = (token: Token, lookahead: Token) => boolean;

export class Parser {
  _tokens: Generator<Token, Token, void>;
  _nodes: Array<Node>;
  _parse: ParseToken;

  constructor(tokens: Generator<Token, Token, void>) {
    this._tokens = tokens;
    this._nodes = [];
    this._parse = (null: any);
  }

  parse(): Node {
    // }
    this._pushNode(this._startSelectorsGroup());
    this._parse = this._parseSelectorsGroup;
    let reconsumeToken = false;
    let token: Token = (null: any);
    let done = false;
    let next = this._tokens.next();
    do {
      if (reconsumeToken) {
        // $FlowFixMe
        reconsumeToken = this._parse(token, next.value);
      } else {
        const current = next;
        next = this._tokens.next();
        if (!current.done) {
          token = current.value;
          ({ value: token, done } = current);
          // $FlowFixMe
          reconsumeToken = this._parse(token, next.value);
        } else {
          done = true;
        }
      }
    } while (!done);
    return this._popNode('SelectorsGroup');
  }

  _eatTokenAndThen(tokenType: TokenType, then: ParseToken): ParseToken {
    return token => {
      if (token.type === tokenType) {
        this._parse = then;
        return false;
      }
      throw new UnexpectedTokenError(token.type, tokenType);
    };
  }

  _parseSelectorsGroup(token: Token): boolean {
    switch (token.type) {
      case tt.eof:
      case tt.comma: {
        const selector = this._popNode('Selector');
        const selectorsGroup = this._topNode('SelectorsGroup');
        selectorsGroup.selectors.push(selector);
        return false;
      }
      case tt.whitespace:
        return false;
      default:
        this._pushNode(this._startSelector());
        this._parse = this._parseSelector;
        return true;
    }
  }

  _parseSelector(token: Token, lookahead: Token): boolean {
    switch (token.type) {
      /* eslint-disable no-fallthrough */
      case tt.whitespace: {
        if (lookahead.type === tt.combinator || lookahead.type === tt.plus) {
          return false;
        }
      }
      case tt.combinator:
      case tt.plus: {
        const simpleSelectorSequence = this._popNode('SimpleSelectorSequence');
        const selector = this._topNode('Selector');
        selector.nodes.push(simpleSelectorSequence);
        selector.nodes.push(this._startCombinator(getCombinatorTypeFromToken(token)));
        this._parse = this._parseCombinator;
        return false;
      }
      /* eslint-enable no-fallthrough */
      case tt.comma:
      case tt.eof: {
        const simpleSelectorSequence = this._popNode('SimpleSelectorSequence');
        const selector = this._topNode('Selector');
        selector.nodes.push(simpleSelectorSequence);
        this._parse = this._parseSelectorsGroup;
        return true;
      }
      default:
        this._pushNode(this._startSimpleSelectorSequence());
        this._parse = this._parseSimpleSelectorSequence;
        return true;
    }
  }

  _parseCombinator(token: Token): boolean {
    switch (token.type) {
      case tt.comma:
      case tt.combinator:
      case tt.eof:
      case tt.plus:
        throw new UnexpectedTokenError(token.type);
      case tt.whitespace:
        return false;
      default:
        this._pushNode(this._startSimpleSelectorSequence());
        this._parse = this._parseSimpleSelectorSequence;
        return true;
    }
  }

  _parseSimpleSelectorSequence(token: Token): boolean {
    switch (token.type) {
      case tt.bracketL:
      case tt.colon:
      case tt.dot:
      case tt.hash:
        this._parse = this._parseSimpleSelectorSequence2;
        return true;
      case tt.ident:
      case tt.pipe:
      case tt.star:
        this._parse = this._parseTypeOrUnivsersalSelector;
        return true;
      case tt.comma:
      case tt.eof:
      case tt.whitespace:
        this._parse = this._parseSelector;
        return true;
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseSimpleSelectorSequence2(token: Token): boolean {
    switch (token.type) {
      case tt.bracketL:
        this._pushNode(this._startSimpleSelector('AttributeSelector'));
        this._parse = this._parseAttributeSelector;
        return false;
      case tt.colon:
        this._pushNode(this._startSimpleSelector('PseudoSelector'));
        this._parse = this._parsePseudoSelector;
        return false;
      case tt.dot:
        this._pushNode(this._startSimpleSelector('ClassSelector'));
        this._parse = this._parseClassSelector;
        return false;
      case tt.hash:
        this._pushNode(this._startSimpleSelector('HashSelector'));
        this._parse = this._parseHashSelector;
        return false;
      case tt.comma:
      case tt.eof:
      case tt.whitespace:
        this._parse = this._parseSelector;
        return true;
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseAttributeSelector(token: Token): boolean {
    return true;
  }

  _parsePseudoSelector(token: Token): boolean {
    return true;
  }

  _parseClassSelector(token: Token): boolean {
    if (token.type === tt.ident) {
      const classSelector = this._popNode('ClassSelector');
      classSelector.value = `${token.value}`;
      const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
      simpleSelectorSequence.nodes.push(classSelector);
      this._parse = this._parseSimpleSelectorSequence2;
      return false;
    }
    throw new UnexpectedTokenError(token.type, tt.ident);
  }

  _parseHashSelector(token: Token): boolean {
    if (token.type === tt.ident) {
      const hashSelector = this._popNode('HashSelector');
      hashSelector.value = `${token.value}`;
      const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
      simpleSelectorSequence.nodes.push(hashSelector);
      this._parse = this._parseSimpleSelectorSequence2;
      return false;
    }
    throw new UnexpectedTokenError(token.type, tt.ident);
  }

  _parseTypeOrUnivsersalSelector(token: Token, lookahead: Token): boolean {
    if (token.type === tt.pipe || lookahead && lookahead.type === tt.pipe) {
      this._parse = this._parseNamespacePrefix;
      return true;
    }
    if (token.type === tt.ident || token.type === tt.star) {
      const simpleSelector = (token.type === tt.ident) ?
        this._startSimpleSelector('ElementSelector', token.value) :
        this._startSimpleSelector('UniversalSelector', '*');

      if (this._topNode().type === 'NamespacePrefix') {
        const namespacePrefix = this._popNode('NamespacePrefix');
        simpleSelector.namespace = namespacePrefix;
      }
      const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
      simpleSelectorSequence.nodes.push(simpleSelector);

      this._parse = this._parseSimpleSelectorSequence2;
      return false;
    }
    throw new UnexpectedTokenError(token.type);
  }

  _parseNamespacePrefix(token: Token, lookahead: Token): boolean {
    if (token.type === tt.pipe) {
      this._pushNode(this._startNamespace());
      this._parse = this._parseTypeOrUnivsersalSelector;
      return false;
    }
    if (lookahead.type === tt.pipe) {
      let prefix = '';
      switch (token.type) {
        case tt.star:
          prefix = '*';
          break;
        case tt.ident:
          prefix = `${token.value}`;
          break;
        default:
          throw new UnexpectedTokenError(token.type);
      }
      this._pushNode(this._startNamespace(prefix));
      this._parse = this._eatTokenAndThen(tt.pipe, this._parseTypeOrUnivsersalSelector);
      return false;
    }
    throw new UnexpectedTokenError(token.type);
  }

  _pushNode(node: Node): void {
    this._nodes.push(node);
  }

  _popNode(type: string): Node {
    const node = this._topNode(type);
    this._nodes.pop();
    return node;
  }

  _startSelectorsGroup(): Node {
    return { type: 'SelectorsGroup', selectors: [] };
  }

  _startCombinator(combinator: string): Node {
    return { type: 'Combinator', combinator };
  }

  _startSelector(type: string = 'Selector'): Node {
    return { type, nodes: [] };
  }

  _startSimpleSelectorSequence(): Node {
    return { type: 'SimpleSelectorSequence', nodes: [] };
  }

  _startSimpleSelector(type: string, value: any): Node {
    return { type, value };
  }

  _startNamespace(namespace: string = ''): Node {
    return { type: 'NamespacePrefix', namespace };
  }

  _topNode(type: ?string): Node {
    const top = this._nodes[this._nodes.length - 1];
    if (!!type && top.type !== type) {
      throw new UnexpectedTopNodeError(top.type, type);
    }
    return top;
  }
}

export default function parse(input: string): Node {
  return new Parser(tokenize(input)).parse();
}

function getCombinatorTypeFromToken(token: Token): string {
  switch (token.type) {
    case tt.whitespace:
      return 'whitespace';
    case tt.plus:
      return '+';
    case tt.combinator:
      return `${token.value}`;
    default:
      throw new Error();
  }
}
