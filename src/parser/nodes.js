/* @flow */
// Identifier
export type Identifier =
  { type: 'Identifier'; value: string; }

// Literals
export type StringLiteral =
  { type: 'StringLiteral'; value: string; };

// SelectorsGroup
export type SelectorsGroup =
  { type: 'SelectorsGroup'; body: Array<Selector>; }

export type Selector =
  { type: 'Selector'; body: Array<SimpleSelectorSequence|Combinator>; }

export type SimpleSelectorSequence =
  { type: 'SimpleSelectorSequence'; body: Array<SimpleSelector>; };

export type CombinatorOperator = '+' | '~' | '>' | 'whitespace';
export type Combinator =
  { type: 'Combinator'; operator: CombinatorOperator; };

export type SimpleSelector =
  TypeSelector |
  UniversalSelector |
  AttributeSelector |
  ClassSelector |
  HashSelector |
  PseudoSelector;

export type NamespacePrefix =
  { type: 'NamespacePrefix'; namespace: Identifier; };

export type TypeSelector =
  { type: 'TypeSelector'; body: Identifier; namespace: ?NamespacePrefix; };

export type UniversalSelector =
  { type: 'UniversalSelector'; namespace: ?NamespacePrefix; };

export type AttributeSelectorOperator = '=' | '~=' | '|=' | '^=' | '$=' | '*=';
export type AttributeSelector = {
  type: 'AttributeSelector';
  attribute: AttributeSelectorAttribute;
  operator: ?AttributeSelectorOperator;
  value: ?AttributeSelectorValue;
};

export type AttributeSelectorAttribute =
  { type: 'AttributeSelectorAttribute'; attribute: Identifier; namespace: ?NamespacePrefix; };

export type AttributeSelectorValue = Identifier | StringLiteral;

export type ClassSelector =
  { type: 'ClassSelector'; className: Identifier; };

export type HashSelector =
  { type: 'HashSelector'; id: Identifier; };

export type PseudoSelector =
  { type: 'PseudoSelector'; body: PseudoElementSelector | PseudoClassSelector | CallExpression; };

export type PseudoClassSelector =
  { type: 'PseudoClassSelector'; body: Identifier; }

export type PseudoElementSelector =
  { type: 'PseudoElementSelector'; body: Identifier; }

export type CallExpression =
  { type: 'CallExpression'; argument: FunctionArgument; isNegationCall: false } |
  { type: 'CallExpression'; argument: NegationArgument; isNegationCall: true };

export type FunctionArgument =
  { type: 'FunctionArgument'; body: Array<Identifier>; };

export type NegationArgument =
  { type: 'NegationArgument'; body: SimpleSelector };

export type Node =
  AttributeSelector |
  CallExpression |
  ClassSelector |
  Combinator |
  FunctionArgument |
  HashSelector |
  Identifier |
  NamespacePrefix |
  NegationArgument |
  PseudoClassSelector |
  PseudoElementSelector |
  PseudoSelector |
  Selector |
  SelectorsGroup |
  SimpleSelector |
  SimpleSelectorSequence |
  StringLiteral |
  TypeSelector |
  UniversalSelector;

export const createSelectorsGroup =
  (): SelectorsGroup => ({ type: 'SelectorsGroup', body: [] });

export const createSelector =
  (): Selector => ({ type: 'Selector', body: [] });

export const createSimpleSelectorSequence =
  (): SimpleSelectorSequence => ({ type: 'SimpleSelectorSequence', body: [] });

export const createCombinator =
  (operator: CombinatorOperator): Combinator => ({ type: 'Combinator', operator });

export const createNamespacePrefix =
  (namespace: Identifier): NamespacePrefix => ({ type: 'NamespacePrefix', namespace });

export const createTypeSelector = (
  body: Identifier,
  namespace: ?NamespacePrefix
): TypeSelector => ({ type: 'TypeSelector', body, namespace });

export const createUniversalSelector = (
  namespace: ?NamespacePrefix
): UniversalSelector => ({ type: 'UniversalSelector', body: '*', namespace });

export const createAttributeSelector = (
  attribute: AttributeSelectorAttribute,
  operator: ?AttributeSelectorOperator,
  value: ?AttributeSelectorValue
): AttributeSelector => ({ type: 'AttributeSelector', attribute, operator, value });

export const createAttributeSelectorAttribute = (
  attribute: Identifier,
  namespace: ?NamespacePrefix
): AttributeSelectorAttribute => ({ type: 'AttributeSelectorAttribute', attribute, namespace });

export const createClassSelector =
  (className: Identifier): ClassSelector => ({ type: 'ClassSelector', className });

export const createHashSelector =
  (id: Identifier): HashSelector => ({ type: 'HashSelector', id });

export const createPseudoSelector = (
  body: PseudoElementSelector | PseudoClassSelector
): PseudoSelector => ({ type: 'PseudoSelector', body });

export const createPseudoClassSelector =
  (body: Identifier): PseudoClassSelector => ({ type: 'PseudoClassSelector', body });

export const createPseudoElementSelector =
  (body: Identifier): PseudoElementSelector => ({ type: 'PseudoElementSelector', body });

export const createCallExpression = (
  argument: FunctionArgument
): CallExpression => ({ type: 'CallExpression', argument, isNegationCall: false });

export const createNegationCall = (
  argument: NegationArgument
): CallExpression => ({ type: 'CallExpression', argument, isNegationCall: true });

export const createFunctionArgument =
  (): FunctionArgument => ({ type: 'FunctionArgument', body: [] });

export const createNegationArgument =
  (body: SimpleSelector): NegationArgument => ({ type: 'NegationArgument', body });

export const createIdentifier =
  (value: string): Identifier => ({ type: 'Identifier', value });

export const createStringLiteral =
  (value: string): StringLiteral => ({ type: 'StringLiteral', value });
