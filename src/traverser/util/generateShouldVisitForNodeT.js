/* @flow */
import type { Node } from '../../util/nodes';

export type ShouldVisit = (node: Node) => boolean;

export default function generateShouldVisitForNodeT<NodeT: Node>(
  nodeT: Class<NodeT>,
): ShouldVisit {
  return (node: Node): boolean => node instanceof nodeT;
}
