/* @flow */
import Identifier from './Identifier';
import SimpleSelector from './SimpleSelector';

export default class ClassSelector extends SimpleSelector {
  value: Identifier;

  constructor(value: Identifier) {
    super('ClassSelector');
    this.value = value;
  }
}
