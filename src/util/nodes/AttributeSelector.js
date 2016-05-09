/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type NamespacePrefix from './NamespacePrefix';
import type StringLiteral from './StringLiteral';
import type { DefaultTraverser } from '../../traverser';

// @TODO Generalize with tokenizer
export type AttributeSelectorMatcherValue = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

export default class AttributeSelector extends SimpleSelector {
  attribute: AttributeSelectorAttribute;

  constructor(attribute: AttributeSelectorAttribute) {
    super('AttributeSelector');
    this.attribute = attribute;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.attribute);
  }
}

export class AttributeSelectorWithMatcher extends AttributeSelector {
  matcher: AttributeSelectorMatcher;
  value: AttributeSelectorValue;
  caseSensitive: boolean;

  constructor(
    attribute: AttributeSelectorAttribute,
    matcher: AttributeSelectorMatcher,
    value: AttributeSelectorValue,
    caseSensitive: boolean,
  ) {
    super(attribute);
    this.matcher = matcher;
    this.value = value;
    this.caseSensitive = caseSensitive;
  }

  accept(traverser: DefaultTraverser): void {
    super.accept(traverser);
    traverser.visit(this.matcher);
    traverser.visit(this.value);
  }
}

export class AttributeSelectorAttribute extends Node {
  namespacePrefix: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespacePrefix: ?NamespacePrefix) {
    super('AttributeSelectorAttribute');
    this.namespacePrefix = namespacePrefix;
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
    if (this.namespacePrefix) {
      traverser.visit(this.namespacePrefix);
    }
  }
}

export class AttributeSelectorMatcher extends Node {
  value: AttributeSelectorMatcherValue;

  constructor(value: AttributeSelectorMatcherValue) {
    super('AttributeSelectorMatcher');
    this.value = value;
  }
}

export class AttributeSelectorValue extends Node {
  value: Identifier|StringLiteral;

  constructor(value: Identifier|StringLiteral) {
    super('AttributeSelectorValue');
    this.value = value;
  }

  accept(traverser: DefaultTraverser): void {
    traverser.visit(this.value);
  }
}
