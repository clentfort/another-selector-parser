/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type Visitor from '../../traverser/visitor';

type PseudoSelectorType = 'PseudoClassSelector' | 'PseudoElementSelector';
// $FlowIssue
type PseudoSelectorBody = CallExpression | Identifier;

export default class PseudoSelector extends SimpleSelector {
  body: PseudoSelectorBody;

  constructor(type: PseudoSelectorType, body: PseudoSelectorBody) {
    super(type);
    this.body = body;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.body);
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

  accept(visitor: Visitor): void {
    visitor.visit(this.callee);
    this.params.forEach(param => visitor.visit(param));
  }
}
