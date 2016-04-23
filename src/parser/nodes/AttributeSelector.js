/* @flow */
import Identifier from './Identifier';
import NamespacePrefix from './NamespacePrefix';
import Node from './Node';

// @TODO Generalize with tokenizer
export type AttributeSelectorMatcherValue = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

export default class AttributeSelector extends Node {
  attribute: AttributeSelectorAttribute;

  constructor(attribute: AttributeSelectorAttribute) {
    super('AttributeSelector');
    this.attribute = attribute;
  }
}

export class AttributeSelectorWithMatcher extends AttributeSelector {
  matcher: AttributeSelectorMatcher;
  value: AttributeSelectorValue;

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
  value: Identifier;

  constructor(value: Identifier) {
    super('AttributeSelectorValue');
    this.value = value;
  }
}
