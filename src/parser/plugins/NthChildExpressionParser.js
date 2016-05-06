/* @flow */
import { Node, NumberLiteral, SelectorList } from '../nodes';
import { UnexpectedTokenError } from '../util/Errors';
import Plugin from './Plugin';

import type { Token } from '../../tokenizer/tokens';

export class NthChildExpressionArgument extends Node {
  step: NumberLiteral;
  offset: NumberLiteral;
  of: ?SelectorList;

  constructor(step: NumberLiteral, offset: NumberLiteral) {
    super('NthChildExpressionArgument');
    this.step = step;
    this.offset = offset;
  }
}

const offsetRegExp = /^n(-\d+)$/i;

export class NthChildExpressionWithOfSelectorArgument extends
NthChildExpressionArgument {
  constructor(
    step: NumberLiteral,
    offset: NumberLiteral,
    of: SelectorList,
  ) {
    super(step, offset);
    this.of = of;
  }
}

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
    const n = this._parser.parseIdentifier();
    let offset;
    const value = n.value.toLowerCase();
    if (value === 'n' || value === 'n-') {
      offset = this._parseNextNumber();
      if (value[1] === '-') {
        offset.value = -offset.value;
      }
    } else {
      const matching = value.match(offsetRegExp);
      if (!matching) {
        throw new UnexpectedTokenError(
          this._parser.getCurrentToken(),
          'ident',
          'n',
        );
      }
      offset = new NumberLiteral(-parseInt(matching[1], 10));
    }

    const possibleParenR = this._parser.getCurrentToken();
    if (possibleParenR.type === 'parenR') {
      this._parser.nextToken();
      this._parser.popContext('NthChildExpressionParser.parse');
      return [this._parser.finishNode(
        new NthChildExpressionArgument(step, offset),
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
    this._parser.nextToken();
    this._parser.popContext('NthChildExpressionParser.parseOf');

    return [this._parser.finishNode(
      new NthChildExpressionWithOfSelectorArgument(step, offset, selectorList),
      start
    )];
  }
}
