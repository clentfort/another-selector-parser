/* @flow */
import AttributeSelector from './AttributeSelector';
import ClassSelector from './ClassSelector';
import HashSelector from './HashSelector';
import Node from './Node';
import PseudoSelector from './PseudoSelector';
import TypeSelector from './TypeSelector';
import UniversalSelector from './UniversalSelector';

export type SimpleSelector =
  AttributeSelector |
  ClassSelector |
  HashSelector |
  PseudoSelector |
  TypeSelector |
  UniversalSelector;

export default class SimpleSelectorSequence extends Node {
  body: Array<SimpleSelector>;

  constructor() {
    super('SimpleSelectorSequence');
    this.body = [];
  }
}

