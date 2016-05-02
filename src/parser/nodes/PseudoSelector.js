/* @flow */
import Identifier from './Identifier';
import Node from './Node';
import SimpleSelector from './SimpleSelector';

type PseudoSelectorType = 'PseudoClassSelector' | 'PseudoElementSelector';
type PseudoSelectorBody = CallExpression | Identifier;

export default class PseudoSelector extends SimpleSelector {
  body: PseudoSelectorBody;

  constructor(type: PseudoSelectorType, body: PseudoSelectorBody) {
    super(type);
    this.body = body;
  }
}

export class PseudoClassSelector extends PseudoSelector {
  constructor(body: PseudoSelectorBody) {
    super('PseudoClassSelector', body);
  }
}

export class PseudoElementSelector extends PseudoSelector {
  constructor(body: PseudoSelectorBody) {
    super('PseudoElementSelector', body);
  }
}

export class CallExpression extends Node {
  callee: Identifier;
  params: Array<any>;

  constructor(callee: Identifier) {
    super('CallExpression');
    this.callee = callee;
    this.params = [];
  }
}
