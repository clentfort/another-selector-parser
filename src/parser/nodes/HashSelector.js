/* @flow */
import Identifier from './Identifier';
import SimpleSelector from './SimpleSelector';

export default class HashSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('HashSelector');
    this.value = value;
  }
}

