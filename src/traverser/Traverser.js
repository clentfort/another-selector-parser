/* @flow */
import * as nodes from '../util/nodes';

import generateShouldVisitForNodeT from './util/generateShouldVisitForNodeT';

import type { ShouldVisit } from './util/generateShouldVisitForNodeT';
import type { Plugin } from '../plugins';
import type { NodeType } from '../util/nodes';

export type VisitFunction = (node: nodes.Node) => void;
export type Visitors = {
  [key: NodeType]: VisitFunction;
};
type ShouldVisitMap = {[key: NodeType]: ShouldVisit};

export default class Visitor {
  _shouldVisitMap: ShouldVisitMap;
  _visitors: Visitors;

  constructor(visitors: Visitors) {
    this._shouldVisitMap = {};
    this._visitors = visitors;
  }

  setPlugin<T: Plugin>(plugin: Class<T>): void {
    plugin.getNewAstNodes().forEach((nodeT: any) => {
      this._shouldVisitMap[nodeT.name] = generateShouldVisitForNodeT(nodeT);
    });
  }

  visit(node: nodes.Node): void {
    /* eslint-disable new-cap */
    if (!!this._visitors.Node) {
      this._visitors.Node(node);
    }

    if (
      !!this._visitors.AttributeSelector &&
      node instanceof nodes.AttributeSelector
    ) {
      this._visitors.AttributeSelector(node);
    }

    if (
      !!this._visitors.AttributeSelectorAttribute &&
      node instanceof nodes.AttributeSelectorAttribute
    ) {
      this._visitors.AttributeSelectorAttribute(node);
    }

    if (
      !!this._visitors.AttributeSelectorMatcher &&
      node instanceof nodes.AttributeSelectorMatcher
    ) {
      this._visitors.AttributeSelectorMatcher(node);
    }

    if (
      !!this._visitors.AttributeSelectorValue &&
      node instanceof nodes.AttributeSelectorValue
    ) {
      this._visitors.AttributeSelectorValue(node);
    }

    if (
      !!this._visitors.AttributeSelectorWithMatcher &&
      node instanceof nodes.AttributeSelectorWithMatcher
    ) {
      this._visitors.AttributeSelectorWithMatcher(node);
    }

    if (!!this._visitors.ClassSelector && node instanceof nodes.ClassSelector) {
      this._visitors.ClassSelector(node);
    }

    if (!!this._visitors.Combinator && node instanceof nodes.Combinator) {
      this._visitors.Combinator(node);
    }

    if (!!this._visitors.HashSelector && node instanceof nodes.HashSelector) {
      this._visitors.HashSelector(node);
    }

    if (!!this._visitors.Identifier && node instanceof nodes.Identifier) {
      this._visitors.Identifier(node);
    }

    if (!!this._visitors.Literal && node instanceof nodes.Literal) {
      this._visitors.Literal(node);
    }

    if (
      !!this._visitors.NamespacePrefix &&
      node instanceof nodes.NamespacePrefix
    ) {
      this._visitors.NamespacePrefix(node);
    }

    if (!!this._visitors.NumberLiteral && node instanceof nodes.NumberLiteral) {
      this._visitors.NumberLiteral(node);
    }

    if (
      !!this._visitors.PseudoSelector &&
      node instanceof nodes.PseudoSelector
    ) {
      this._visitors.PseudoSelector(node);
    }

    if (
      !!this._visitors.CallExpression &&
      node instanceof nodes.CallExpression
    ) {
      this._visitors.CallExpression(node);
    }

    if (
      !!this._visitors.PseudoClassSelector &&
      node instanceof nodes.PseudoClassSelector
    ) {
      this._visitors.PseudoClassSelector(node);
    }

    if (
      !!this._visitors.PseudoElementSelector &&
      node instanceof nodes.PseudoElementSelector
    ) {
      this._visitors.PseudoElementSelector(node);
    }

    if (!!this._visitors.Selector && node instanceof nodes.Selector) {
      this._visitors.Selector(node);
    }

    if (!!this._visitors.SelectorList && node instanceof nodes.SelectorList) {
      this._visitors.SelectorList(node);
    }

    if (
      !!this._visitors.SimpleSelector &&
      node instanceof nodes.SimpleSelector
    ) {
      this._visitors.SimpleSelector(node);
    }

    if (
      !!this._visitors.SimpleSelectorList &&
      node instanceof nodes.SimpleSelectorList
    ) {
      this._visitors.SimpleSelectorList(node);
    }

    if (
      !!this._visitors.StringLiteral &&
      node instanceof nodes.StringLiteral
    ) {
      this._visitors.StringLiteral(node);
    }

    if (
      !!this._visitors.TypeSelector &&
      node instanceof nodes.TypeSelector
    ) {
      this._visitors.TypeSelector(node);
    }

    if (
      !!this._visitors.UniversalSelector &&
      node instanceof nodes.UniversalSelector
    ) {
      this._visitors.UniversalSelector(node);
    }
    /* eslint-enable new-cap */

    Object.keys(this._shouldVisitMap).forEach(nodeType => {
      const shouldVisit = this._shouldVisitMap[nodeType];
      if (!!this._visitors[nodeType] && shouldVisit(node)) {
        this._visitors[nodeType](node);
      }
    });
    node.accept(this);
  }
}
