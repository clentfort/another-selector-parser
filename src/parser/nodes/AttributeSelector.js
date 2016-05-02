/* @flow */
import Identifier from './Identifier';
import NamespacePrefix from './NamespacePrefix';
import Node from './Node';
import SimpleSelector from './SimpleSelector';
import StringLiteral from './StringLiteral';

// @TODO Generalize with tokenizer
export type AttributeSelectorMatcherValue = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

export default class AttributeSelector extends SimpleSelector {
  attribute: AttributeSelectorAttribute;
  matcher: ?AttributeSelectorMatcher;
  value: ?AttributeSelectorValue;

  constructor(attribute: AttributeSelectorAttribute) {
    super('AttributeSelector');
    this.attribute = attribute;
  }
}

export class AttributeSelectorWithMatcher extends AttributeSelector {
  constructor(
    attribute: AttributeSelectorAttribute,
    matcher: AttributeSelectorMatcher,
    value: AttributeSelectorValue
  ) {
    super(attribute);
    this.matcher = matcher;
    this.value = value;
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
}
