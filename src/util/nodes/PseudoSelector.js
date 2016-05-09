/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type { DefaultTraverser } from '../../traverser';

type PseudoSelectorType = 'PseudoClassSelector' | 'PseudoElementSelector';
type PseudoSelectorValue = CallExpression | Identifier;

export default class PseudoSelector extends SimpleSelector {
  value: PseudoSelectorValue;

  constructor(type: PseudoSelectorType, value: PseudoSelectorValue) {
    super(type);
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
  }
}

export class PseudoClassSelector extends PseudoSelector {
  constructor(body: PseudoSelectorValue) {
    super('PseudoClassSelector', body);
  }
}

export class PseudoElementSelector extends PseudoSelector {
  constructor(body: PseudoSelectorValue) {
    super('PseudoElementSelector', body);
  }
}

export class CallExpression extends Node {
  callee: Identifier;
  params: Array<any>;

  constructor(callee: Identifier, params: Array<any> = []) {
    super('CallExpression');
    this.callee = callee;
    this.params = params;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.callee);
    this.params.forEach(param => traverser.visit(param));
  }
}
