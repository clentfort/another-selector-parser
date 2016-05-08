/* @flow */
import Node from './Node';
import SimpleSelector from './SimpleSelector';

import type Identifier from './Identifier';
import type NamespacePrefix from './NamespacePrefix';
import type StringLiteral from './StringLiteral';
import type Visitor from '../../traverser/visitor';

// @TODO Generalize with tokenizer
export type AttributeSelectorMatcherValue = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

export default class AttributeSelector extends SimpleSelector {
  attribute: AttributeSelectorAttribute;

  constructor(attribute: AttributeSelectorAttribute) {
    super('AttributeSelector');
    this.attribute = attribute;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.attribute);
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

  accept(visitor: Visitor): void {
    visitor.visit(this.attribute);
    visitor.visit(this.matcher);
    visitor.visit(this.value);
  }
}

export class AttributeSelectorAttribute extends Node {
  namespace: ?NamespacePrefix;
  value: Identifier;

  constructor(value: Identifier, namespace: ?NamespacePrefix) {
    super('AttributeSelectorAttribute');
    this.namespace = namespace;
    this.value = value;
  }

  accept(visitor: Visitor): void {
    visitor.visit(this.value);
    if (this.namespace) {
      visitor.visit(this.namespace);
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

  accept(visitor: Visitor): void {
    visitor.visit(this.value);
  }
}
