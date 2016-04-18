/* @flow */
import {
  UnexpectedTokenError,
  UnexpectedTopNodeError,
} from './Errors';
import * as helper from './nodes';
import tokenize from '../tokenizer';

import type { Token, TokenType } from '../tokenizer/types';
import type {
  AttributeSelector,
  ClassSelector,
  Combinator,
  CombinatorOperator,
  FunctionArgument,
  FunctionCall,
  HashSelector,
  NamespacePrefix,
  NegationArgument,
  Node,
  PseudoClassSelector,
  PseudoElementSelector,
  PseudoSelector,
  Selector,
  SelectorsGroup,
  SimpleSelector,
  SimpleSelectorSequence,
  TypeSelector,
  UniversalSelector,
} from './nodes';

type ParseToken = (token: Token, lookahead: Token) => boolean;

export class Parser {
  _nodes: Array<Node>;
  _parse: ParseToken;
  _parsingNegationArgument: boolean;
  _tokens: Generator<Token, Token, void>;

  constructor(tokens: Generator<Token, Token, void>) {
    this._nodes = [];
    this._parse = (null: any);
    this._parsingNegationArgument = false;
    this._tokens = tokens;
  }

  parse(): Node {
    // }
    this._pushNode(helper.createSelectorsGroup());
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
      case 'EOF':
      case 'comma': {
        if (this._topNode().type === 'Selector') {
          const selector = this._popNode('Selector');
          const selectorsGroup = this._topNode('SelectorsGroup');
          selectorsGroup.selectors.push(selector);
        } else {
          this._topNode('SelectorsGroup');
        }
        return false;
      }
      case 'whitespace':
        return false;
      default:
        this._pushNode(helper.createSelector());
        this._parse = this._parseSelector;
        return true;
    }
  }

  _parseSelector(token: Token, lookahead: Token): boolean {
    switch (token.type) {
      /* eslint-disable no-fallthrough */
      case 'whitespace': {
        if (lookahead.type === 'combinator' || lookahead.type === 'plus') {
          return false;
        }
      }
      case 'combinator':
      case 'plus': {
        const simpleSelectorSequence = this._popNode('SimpleSelectorSequence');
        const selector = this._topNode('Selector');
        selector.body.push(simpleSelectorSequence);
        selector.body.push(helper.createCombinator(getCombinatorTypeFromToken(token)));
        this._parse = this._parseCombinator;
        return false;
      }
      /* eslint-enable no-fallthrough */
      case 'comma':
      case 'EOF': {
        const simpleSelectorSequence = this._popNode('SimpleSelectorSequence');
        const selector = this._topNode('Selector');
        selector.body.push(simpleSelectorSequence);
        this._parse = this._parseSelectorsGroup;
        return true;
      }
      default:
        this._pushNode(helper.createSimpleSelectorSequence());
        this._parse = this._parseSimpleSelectorSequence;
        return true;
    }
  }

  _parseCombinator(token: Token): boolean {
    switch (token.type) {
      case 'comma':
      case 'combinator':
      case 'EOF':
      case 'plus':
        throw new UnexpectedTokenError(token.type);
      case 'whitespace':
        return false;
      default:
        this._pushNode(helper.createSimpleSelectorSequence());
        this._parse = this._parseSimpleSelectorSequence;
        return true;
    }
  }

  _parseSimpleSelectorSequence(token: Token): boolean {
    switch (token.type) {
      case 'bracketL':
      case 'colon':
      case 'dot':
      case 'hash':
        this._parse = this._parseSimpleSelectorSequence2;
        return true;
      case 'ident':
      case 'pipe':
      case 'star':
        this._parse = this._parseTypeOrUnivsersalSelector;
        return true;
      case 'comma':
      case 'EOF':
      case 'whitespace':
        this._parse = this._parseSelector;
        return true;
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseSimpleSelectorSequence2(token: Token): boolean {
    switch (token.type) {
      case 'bracketL':
        // $FlowFixMe
        this._pushNode(helper.createAttributeSelector());
        this._parse = this._parseAttributeSelector;
        return false;
      case 'colon':
        // $FlowFixMe
        this._pushNode(helper.createPseudoSelector());
        this._parse = this._parsePseudoSelector;
        return false;
      case 'dot':
        // $FlowFixMe
        this._pushNode(helper.createClassSelector());
        this._parse = this._parseClassSelector;
        return false;
      case 'hash':
        // $FlowFixMe
        this._pushNode(helper.createHashSelector());
        this._parse = this._parseHashSelector;
        return false;
      case 'comma':
      case 'EOF':
      case 'whitespace':
        this._parse = this._parseSelector;
        return true;
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseTypeOrUnivsersalSelector(token: Token, lookahead: Token): boolean {
    if (token.type === 'pipe' || lookahead && lookahead.type === 'pipe') {
      this._parse = this._parseNamespacePrefix;
      return true;
    }
    if (token.type === 'ident' || token.type === 'star') {
      let namespace;
      if (this._topNode().type === 'NamespacePrefix') {
        namespace = this._popNode('NamespacePrefix');
      }
      let simpleSelector;
      if (token.type === 'ident') {
        simpleSelector = helper.createTypeSelector(token.value, namespace);
      } else {
        simpleSelector = helper.createUniversalSelector(namespace);
      }

      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = simpleSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(simpleSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    throw new UnexpectedTokenError(token.type);
  }

  _parseNamespacePrefix(token: Token, lookahead: Token): boolean {
    if (token.type === 'pipe') {
      this._pushNode(helper.createNamespacePrefix());
      this._parse = this._parseTypeOrUnivsersalSelector;
      return false;
    }
    if (lookahead.type === 'pipe') {
      if (token.type === 'star' || token.type === 'ident') {
        const returnTo = (this._topNode().type === 'AttributeSelector') ?
          this._parseAttributeSelector :
          this._parseTypeOrUnivsersalSelector;
        const prefix = (token.type === 'star') ? '*' : token.value;
        this._pushNode(helper.createNamespacePrefix(prefix));
        this._parse = this._eatTokenAndThen('pipe', returnTo);
        return false;
      }
      throw new UnexpectedTokenError(token.type);
    }
    throw new UnexpectedTokenError(token.type);
  }

  _parseAttributeSelector(token: Token, lookahead: Token): boolean {
    if (token.type === 'whitespace') {
      return false;
    }
    if (token.type === 'pipe' || lookahead && lookahead.type === 'pipe') {
      this._parse = this._parseNamespacePrefix;
      return true;
    }
    if (token.type === 'ident') {
      let namespace;
      if (this._topNode().type === 'NamespacePrefix') {
        namespace = this._popNode('NamespacePrefix');
      }
      const attribute = helper.createAttributeSelectorAttribute(token.value, namespace);
      const attributeSelector = this._topNode('AttributeSelector');
      attributeSelector.attribute = attribute;
      this._parse = this._parseAttributeMatcher;
      return false;
    }
    throw new UnexpectedTokenError(token.type, 'ident');
  }

  _parseAttributeMatcher(token: Token): boolean {
    if (token.type === 'whitespace') {
      return false;
    }
    if (token.type === 'matcher') {
      const attributeSelector = this._topNode('AttributeSelector');
      attributeSelector.operator = token.value;
      this._parse = this._parseAttributeMatcherValue;
      return false;
    }
    if (token.type === 'bracketR') {
      const attributeSelector = this._popNode('AttributeSelector');
      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = attributeSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(attributeSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    return false;
  }

  _parseAttributeMatcherValue(token: Token): boolean {
    if (token.type === 'whitespace') {
      return false;
    }
    if (token.type === 'ident' || token.type === 'string') {
      const attributeSelector = this._topNode('AttributeSelector');
      attributeSelector.value = token.value;
      return false;
    }
    this._parse = this._parseAttributeMatcher;
    return true;
  }

  _parsePseudoSelector(token: Token, lookahead: Token): boolean {
    if (token.type === 'colon') {
      // $FlowFixMe
      this._pushNode(helper.createPseudoElementSelector());
      return false;
    }
    if (token.type === 'ident') {
      if (lookahead.type === 'parenL') {
        this._parse = this._parseFunction;
        return true;
      }

      let pseudoSubSelector;
      if (this._topNode().type === 'PseudoElementSelector') {
        pseudoSubSelector = this._popNode('PseudoElementSelector');
        pseudoSubSelector.body = token.value;
      } else {
        pseudoSubSelector = helper.createPseudoClassSelector(token.value);
      }

      const pseudoSelector = this._popNode('PseudoSelector');
      pseudoSelector.body = pseudoSubSelector;
      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = pseudoSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(pseudoSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    throw new UnexpectedTokenError(token.type);
  }

  _parseFunction(token: Token): boolean {
    if (token.type === 'ident') {
      const value = token.value;
      const isNegationCall = (value.toLowerCase() === 'not');
      if (this._parsingNegationArgument && isNegationCall) {
        throw new Error();
      }
      if (isNegationCall) {
        // $FlowFixMe
        this._pushNode(helper.createNegationCall());
      } else {
        // $FlowFixMe
        this._pushNode(helper.createFunctionCall());
      }
      this._parse = isNegationCall ? this._parseNegationCall : this._parseFunctionCall;
      return false;
    }
    if (token.type === 'parenR') {
      const functionCall = this._popNode('FunctionCall');
      const pseudoSelector = this._popNode('PseudoSelector');
      pseudoSelector.body = functionCall;
      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = pseudoSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(pseudoSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    throw new UnexpectedTokenError(token.type, 'ident');
  }

  _parseNegationCall(token: Token): boolean {
    if (token.type === 'parenL') {
      this._parsingNegationArgument = true;
      // $FlowFixMe
      this._pushNode(helper.createNegationArgument());
      this._parse = this._parseNegationArgument;
      return false;
    }
    if (token.type === 'parenR') {
      this._parsingNegationArgument = false;
      this._parse = this._parseFunction;
      return true;
    }
    throw new UnexpectedTokenError(token.type, 'parenL');
  }

  _parseNegationArgument(token: Token): boolean {
    switch (token.type) {
      case 'bracketL':
        this._topNode('NegationArgument');
        // $FlowFixMe
        this._pushNode(helper.createAttributeSelector());
        this._parse = this._parseAttributeSelector;
        return false;
      case 'colon': {
        this._topNode('NegationArgument');
        // $FlowFixMe
        this._pushNode(helper.createPseudoSelector());
        this._parse = this._parsePseudoSelector;
        return false;
      }
      case 'dot':
        this._topNode('NegationArgument');
        // $FlowFixMe
        this._pushNode(helper.createClassSelector());
        this._parse = this._parseClassSelector;
        return false;
      case 'hash':
        this._topNode('NegationArgument');
        // $FlowFixMe
        this._pushNode(helper.createHashSelector());
        this._parse = this._parseHashSelector;
        return false;
      case 'ident':
      case 'pipe':
      case 'star':
        this._topNode('NegationArgument');
        this._parse = this._parseTypeOrUnivsersalSelector;
        return true;
      case 'parenR': {
        const negationArgument = this._popNode('NegationArgument');
        const functionCall = this._topNode('FunctionCall');
        if (functionCall.isNegationCall) {
          functionCall.argument = negationArgument;
        } else {
          throw new Error();
        }
        this._parse = this._parseNegationCall;
        return true;
      }
      case 'whitespace':
        return false;
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseFunctionCall(token: Token): boolean {
    if (token.type === 'parenL') {
      // $FlowFixMe
      this._pushNode(helper.createFunctionArgument(null, false));
      this._parse = this._parseFunctionArgument;
      return false;
    }
    if (token.type === 'parenR') {
      this._parse = this._parseFunction;
      return true;
    }
    throw new UnexpectedTokenError(token.type, 'parenL');
  }

  _parseFunctionArgument(token: Token): boolean {
    let functionArg: Node;
    switch (token.type) {
      case 'whitespace':
        return false;
      case 'plus':
        functionArg = this._topNode('FunctionArgument');
        functionArg.body += '+';
        return false;
      case 'minus':
        functionArg = this._topNode('FunctionArgument');
        functionArg.body += '-';
        return false;
      case 'ident':
      case 'num':
      case 'string':
        functionArg = this._topNode('FunctionArgument');
        functionArg.body += token.value;
        return false;
      case 'parenR': {
        functionArg = this._popNode('FunctionArgument');
        const functionCall = this._topNode('FunctionCall');
        if (!functionCall.isNegationCall) {
          functionCall.argument = functionArg;
        } else {
          throw new Error();
        }
        this._parse = this._parseFunctionCall;
        return true;
      }
      default:
        throw new UnexpectedTokenError(token.type);
    }
  }

  _parseClassSelector(token: Token): boolean {
    if (token.type === 'ident') {
      const classSelector = this._popNode('ClassSelector');
      classSelector.className = token.value;
      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = classSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(classSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    throw new UnexpectedTokenError(token.type, 'ident');
  }

  _parseHashSelector(token: Token): boolean {
    if (token.type === 'ident') {
      const hashSelector = this._popNode('HashSelector');
      hashSelector.id = token.value;
      if (this._parsingNegationArgument) {
        const negationArgument = this._topNode('NegationArgument');
        negationArgument.body = hashSelector;
        this._parse = this._parseNegationArgument;
      } else {
        const simpleSelectorSequence = this._topNode('SimpleSelectorSequence');
        simpleSelectorSequence.simpleSelectors.push(hashSelector);
        this._parse = this._parseSimpleSelectorSequence2;
      }
      return false;
    }
    throw new UnexpectedTokenError(token.type, 'ident');
  }

  _pushNode(node: Node): void {
    this._nodes.push(node);
  }

  _popNode:
    ((type: 'SelectorsGroup') => SelectorsGroup) &
    ((type: 'Selector') => Selector) &
    ((type: 'SimpleSelectorSequence') => SimpleSelectorSequence) &
    ((type: 'Combinator') => Combinator) &
    ((type: 'SimpleSelector') => SimpleSelector) &
    ((type: 'NamespacePrefix') => NamespacePrefix) &
    ((type: 'TypeSelector') => TypeSelector) &
    ((type: 'UniversalSelector') => UniversalSelector) &
    ((type: 'AttributeSelector') => AttributeSelector) &
    ((type: 'ClassSelector') => ClassSelector) &
    ((type: 'HashSelector') => HashSelector) &
    ((type: 'PseudoSelector') => PseudoSelector) &
    ((type: 'PseudoClassSelector') => PseudoClassSelector) &
    ((type: 'PseudoElementSelector') => PseudoElementSelector) &
    ((type: 'FunctionCall') => FunctionCall) &
    ((type: 'FunctionArgument') => FunctionArgument) &
    ((type: 'NegationArgument') => NegationArgument) &
    ((type: ?string) => Node);
  // $FlowFixMe
  _popNode(type) {
    const node = this._topNode(type);
    this._nodes.pop();
    return node;
  }

  _topNode:
    ((type: 'SelectorsGroup') => SelectorsGroup) &
    ((type: 'Selector') => Selector) &
    ((type: 'SimpleSelectorSequence') => SimpleSelectorSequence) &
    ((type: 'Combinator') => Combinator) &
    ((type: 'SimpleSelector') => SimpleSelector) &
    ((type: 'NamespacePrefix') => NamespacePrefix) &
    ((type: 'TypeSelector') => TypeSelector) &
    ((type: 'UniversalSelector') => UniversalSelector) &
    ((type: 'AttributeSelector') => AttributeSelector) &
    ((type: 'ClassSelector') => ClassSelector) &
    ((type: 'HashSelector') => HashSelector) &
    ((type: 'PseudoSelector') => PseudoSelector) &
    ((type: 'PseudoClassSelector') => PseudoClassSelector) &
    ((type: 'PseudoElementSelector') => PseudoElementSelector) &
    ((type: 'FunctionCall') => FunctionCall) &
    ((type: 'FunctionArgument') => FunctionArgument) &
    ((type: 'NegationArgument') => NegationArgument) &
    ((type: ?string) => Node);
  // $FlowFixMe
  _topNode(type) {
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

function getCombinatorTypeFromToken(token: Token): CombinatorOperator {
  switch (token.type) {
    case 'whitespace':
      return 'whitespace';
    case 'plus':
      return '+';
    case 'combinator':
      return token.value;
    default:
      throw new Error();
  }
}
