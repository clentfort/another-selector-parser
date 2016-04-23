/* @flow */
import Identifier from './Identifier';
import Node from './Node';

type PseudoSelectorType = 'PseudoClassSelector' | 'PseudoElementSelector';
type PseudoSelectorBody = CallExpression | Identifier;

export default class PseudoSelector extends Node {
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
  callee: string;
  params: Array<any>;

  constructor(callee: string, params: Array<any>) {
    super('CallExpression');
    this.callee = callee;
    this.params = params;
  }
}
