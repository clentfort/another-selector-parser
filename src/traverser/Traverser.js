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
const defaultShouldVisitMap = Object.keys(nodes).reduce(
  (result: ShouldVisitMap, nodeType: string): ShouldVisitMap => {
    result[nodeType] = generateShouldVisitForNodeT(nodes[nodeType]);
    return result;
  },
  {}
);

export default class Visitor {
  _shouldVisitMap: ShouldVisitMap;
  _visitors: Visitors;

  constructor(visitors: Visitors) {
    this._shouldVisitMap = { ...defaultShouldVisitMap };
    this._visitors = visitors;
  }

  setPlugin<T: Plugin>(plugin: Class<T>): void {
    plugin.getNewAstNodes().forEach((nodeT: any) => {
      this._shouldVisitMap[nodeT.name] = generateShouldVisitForNodeT(nodeT);
    });
  }

  visit(node: nodes.Node): void {
    Object.keys(this._shouldVisitMap).forEach(nodeType => {
      const shouldVisit = this._shouldVisitMap[nodeType];
      if (!!this._visitors[nodeType] && shouldVisit(node)) {
        this._visitors[nodeType](node);
      }
    });
    node.accept(this);
  }
}
