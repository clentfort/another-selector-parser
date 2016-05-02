/* @flow */
import { Node, NumberLiteral, SelectorsGroup } from '../nodes';
import Plugin from './Plugin';

import type { Token } from '../../tokenizer/tokens';

export class NthChildExpressionArgument extends Node {
  step: NumberLiteral;
  offset: NumberLiteral;

  constructor(step: NumberLiteral, offset: NumberLiteral) {
    super('NthChildExpressionArgument');
    this.step = step;
    this.offset = offset;
  }
}

const offsetRegExp = /^n(-\d+)$/;

export class NthChildExpressionWithOfSelectorArgument extends
NthChildExpressionArgument {
  of: SelectorsGroup;
  constructor(
    step: NumberLiteral,
    offset: NumberLiteral,
    of: SelectorsGroup,
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
      return new NumberLiteral(prefix.value);
    }
    if (prefix.type === 'ident' && prefix.value[0] === '-') {
      return new NumberLiteral(parseInt(prefix.value, 10));
    }
    if (prefix.type !== 'plus' && prefix.type !== 'minus') {
      // @TODO Unexpected token
      throw new Error();
    }
    const num = this._parser.nextToken();
    if (num.type !== 'num') {
      // @TODO Unexpected token
      throw new Error();
    }
    return new NumberLiteral(
      (prefix.type === 'plus' ? 1 : -1) * num.value
    );
  }

  // $FlowFixMe
  parse(): Array<NthChildExpressionArgument> {
    this._parser.getTokenizer().emitWhitespace(false);
    const step = this._parseNextNumber();
    const n = this._parser.nextToken();
    let offset;
    if (n.type === 'ident') {
      if (n.value === 'n' || n.value === 'n-') {
        this._parser.nextToken();
        offset = this._parseNextNumber();
      } else {
        const matching = n.value.match(offsetRegExp);
        if (!matching) {
          // @TODO Unexpected token
          throw new Error();
        }
        offset = new NumberLiteral(-parseInt(matching[1], 10));
      }
    } else {
      // @TODO Unexpected token
      throw new Error();
    }

    const possibleParenR = this._parser.nextToken();
    if (possibleParenR.type === 'parenR') {
      this._parser.nextToken();
      this._parser.getTokenizer().emitWhitespace(true);
      return [new NthChildExpressionArgument(step, offset)];
    }

    if (possibleParenR.type !== 'ident' || possibleParenR.value !== 'of') {
      // @TODO Unexpected token or unexpected value
      throw new Error();
    }

    this._parser.nextToken();

    this._parser.getTokenizer().emitWhitespace(true);
    this._parser.pushShouldStopAt(
      (token: Token): boolean => token.type === 'parenR'
    );
    const selectorsGroup = this._parser.parseSelectorsGroup();
    this._parser.popShouldStopAt();

    return [new NthChildExpressionWithOfSelectorArgument(
      offset,
      step,
      selectorsGroup,
    )];
  }
}
