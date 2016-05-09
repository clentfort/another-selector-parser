/* @flow */
import Parser from './Parser';
import NotExpressionParser from '../plugins/NotExpressionParser';
import NthChildExpressionParser from '../plugins/NthChildExpressionParser';

export const DefaultParser = Parser;
export default class extends Parser {
  constructor(...params: Array<any>) {
    super(...params);
    this.setPlugin(NotExpressionParser);
    this.setPlugin(NthChildExpressionParser);
  }
}
