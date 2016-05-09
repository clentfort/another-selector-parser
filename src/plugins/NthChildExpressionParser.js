/* @flow */
import Plugin from './Plugin';
import { UnexpectedTokenError } from '../parser/util/Errors';
import { Node, NumberLiteral, SelectorList } from '../util/nodes';

import type { Token } from '../tokenizer/tokens';
import type { DefaultTraverser } from '../traverser';
import type { NodeType } from '../util/nodes';

export class NthChildExpressionArgument extends Node {
  step: NumberLiteral;
  offset: NumberLiteral;

  constructor(step: NumberLiteral, offset: NumberLiteral) {
    super('NthChildExpressionArgument');
    this.step = step;
    this.offset = offset;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.step);
    traverser.visit(this.offset);
  }
}

export class NthChildExpressionWithOfSelectorArgument extends
NthChildExpressionArgument {
  of: SelectorList;

  constructor(
    step: NumberLiteral,
    offset: NumberLiteral,
    of: SelectorList,
  ) {
    super(step, offset);
    this.of = of;
  }

  accept(traverser: DefaultTraverser): void {
    super.accept(traverser);
    traverser.visit(this.of);
  }
}

const offsetRegExp = /^n(-\d+)$/i;

export default class NthChildExpressionParser extends Plugin {
  // } {
  //

  // @TODO: Need something more reliable to parse numbers
  _parseNextNumber(): NumberLiteral {
    const prefix = this._parser.getCurrentToken();
    if (prefix.type === 'num') {
      return this._parser.parseNumberLiteral();
    }
    if (prefix.type === 'ident' && prefix.value[0] === '-') {
      const node = this._parser.finishNode(
        new NumberLiteral(parseInt(prefix.value, 10)),
        prefix,
      );
      this._parser.nextToken();
      return node;
    }
    if (prefix.type !== 'plus' && prefix.type !== 'minus') {
      throw new UnexpectedTokenError(prefix, ['plus', 'minus']);
    }
    this._parser.nextToken();
    const number = this._parser.parseNumberLiteral();
    if (prefix.type === 'minus') {
      number.value = -number.value;
    }
    return number;
  }

  // $FlowFixMe
  parse(): Array<NthChildExpressionArgument> {
    this._parser.pushContext({
      emitWhitespace: false,
      name: 'NthChildExpressionParser.parse',
    });
    const start = this._parser.getCurrentToken();
    const step = this._parseNextNumber();
    const startToken = this._parser.getCurrentToken();
    const n = this._parser.parseIdentifier();
    let offset;
    const value = n.value.toLowerCase();
    if (value === 'n') {
      offset = this._parseNextNumber();
    } else if (value === 'n-') {
      offset = this._parseNextNumber();
      offset.value = -offset.value;
    } else {
      const matching = value.match(offsetRegExp);
      if (matching && matching[1]) {
        offset = new NumberLiteral(-parseInt(matching[1], 10));
      } else {
        throw new UnexpectedTokenError(
          startToken,
          'ident',
          'n',
        );
      }
    }

    const possibleParenR = this._parser.getCurrentToken();
    if (possibleParenR.type === 'parenR') {
      this._parser.nextToken();
      this._parser.popContext('NthChildExpressionParser.parse');
      return [this._parser.finishNode(
        new NthChildExpressionArgument(step, offset),
        possibleParenR,
        start,
      )];
    }

    if (
      possibleParenR.type !== 'ident' ||
      possibleParenR.value.toLowerCase() !== 'of'
    ) {
      throw new UnexpectedTokenError(
        this._parser.getCurrentToken(),
        'ident',
        'of',
      );
    }
    this._parser.nextToken();

    this._parser.popContext('NthChildExpressionParser.parse');
    this._parser.pushContext({
      name: 'NthChildExpressionParser.parseOf',
      emitWhitespace: true,
      shouldStopAt: (token: Token): boolean => token.type === 'parenR',
    });
    const selectorList = this._parser.parseSelectorList();
    const parenR = this._parser.nextToken();

    this._parser.popContext('NthChildExpressionParser.parseOf');

    return [this._parser.finishNode(
      new NthChildExpressionWithOfSelectorArgument(step, offset, selectorList),
      parenR,
      start
    )];
  }

  static getTargetNode(): NodeType {
    return 'CallExpression';
  }

  static getTargetExpression(): string {
    return 'nth-child';
  }

  static getNewAstNodes(): Array<any> {
    return [
      NthChildExpressionArgument,
      NthChildExpressionWithOfSelectorArgument,
    ];
  }
}
