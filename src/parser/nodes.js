/* @flow */
export type CombinatorOperator = '+' | '~' | '>' | 'whitespace';
export type AttributeSelectorOperator = '=' | '~=' | '|=' | '^=' | '$=' | '*=';

export type SelectorsGroup = { type: 'SelectorsGroup'; selectors: Array<Selector>; }
export type Selector = { type: 'Selector'; body: Array<SimpleSelectorSequence|Combinator>; }
export type SimpleSelectorSequence = { type: 'SimpleSelectorSequence'; simpleSelectors: Array<SimpleSelector>; };
export type Combinator = { type: 'Combinator'; operator: CombinatorOperator; };
export type SimpleSelector = TypeSelector | UniversalSelector | AttributeSelector | ClassSelector | HashSelector | PseudoSelector;
export type NamespacePrefix = { type: 'NamespacePrefix'; namespace: string; };
export type TypeSelector = { type: 'TypeSelector'; body: string; namespace: ?NamespacePrefix; };
export type UniversalSelector = { type: 'UniversalSelector'; body: '*'; namespace: ?NamespacePrefix; };
export type AttributeSelector = { type: 'AttributeSelector'; attribute: AttributeSelectorAttribute; operator: ?AttributeSelectorOperator; value: ?AttributeSelectorValue; };
export type AttributeSelectorAttribute =
  { type: 'AttributeSelectorAttribute'; attribute: string; namespace: ?NamespacePrefix; };
export type AttributeSelectorValue = string; // String or identToken
export type ClassSelector = { type: 'ClassSelector'; className: string; };
export type HashSelector = { type: 'HashSelector'; id: string; };
export type PseudoSelector = { type: 'PseudoSelector'; body: PseudoElementSelector | PseudoClassSelector | FunctionCall; };
export type PseudoClassSelector = { type: 'PseudoClassSelector'; body: string; }
export type PseudoElementSelector = { type: 'PseudoElementSelector'; body: string; }
export type FunctionCall =
  { type: 'FunctionCall'; argument: FunctionArgument; isNegationCall: false } |
  { type: 'FunctionCall'; argument: NegationArgument; isNegationCall: true };
export type FunctionArgument = { type: 'FunctionArgument'; body: string; };
export type NegationArgument = { type: 'NegationArgument'; body: SimpleSelector };

export type Node =
  SelectorsGroup |
  Selector |
  SimpleSelectorSequence |
  Combinator |
  SimpleSelector |
  NamespacePrefix |
  TypeSelector |
  UniversalSelector |
  AttributeSelector |
  ClassSelector |
  HashSelector |
  PseudoSelector |
  PseudoClassSelector |
  PseudoElementSelector |
  FunctionCall |
  FunctionArgument |
  NegationArgument;

export const createSelectorsGroup =
  (): SelectorsGroup => ({ type: 'SelectorsGroup', selectors: [] });
export const createSelector =
  (): Selector => ({ type: 'Selector', body: [] });
export const createSimpleSelectorSequence =
  (): SimpleSelectorSequence => ({ type: 'SimpleSelectorSequence', simpleSelectors: [] });
export const createCombinator =
  (operator: CombinatorOperator): Combinator => ({ type: 'Combinator', operator });
export const createNamespacePrefix =
  (namespace: string = ''): NamespacePrefix => ({ type: 'NamespacePrefix', namespace });
export const createTypeSelector = (
  body: string,
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
  attribute: string,
  namespace: ?NamespacePrefix
): AttributeSelectorAttribute => ({ type: 'AttributeSelectorAttribute', attribute, namespace });
export const createClassSelector =
  (className: string): ClassSelector => ({ type: 'ClassSelector', className });
export const createHashSelector =
  (id: string): HashSelector => ({ type: 'HashSelector', id });
export const createPseudoSelector = (
  body: PseudoElementSelector | PseudoClassSelector
): PseudoSelector => ({ type: 'PseudoSelector', body });
export const createPseudoClassSelector =
  (body: string): PseudoClassSelector => ({ type: 'PseudoClassSelector', body });
export const createPseudoElementSelector =
  (body: string): PseudoElementSelector => ({ type: 'PseudoElementSelector', body });
export const createFunctionCall = (
  argument: FunctionArgument | NegationArgument,
  isNegationCall: boolean
// $FlowFixMe
): FunctionCall => ({ type: 'FunctionCall', argument, isNegationCall });
export const createFunctionArgument =
  (body: string): FunctionArgument => ({ type: 'FunctionArgument', body });
export const createNegationArgument =
  (body: SimpleSelector): NegationArgument => ({ type: 'NegationArgument', body });
