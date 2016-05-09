import Traverser from './Traverser';
import NotExpressionParser from '../plugins/NotExpressionParser';
import NthChildExpressionParser from '../plugins/NthChildExpressionParser';

export const DefaultTraverser = Traverser;
export default class extends Traverser {
  constructor(...params: Array<any>) {
    super(...params);
    this.setPlugin(NotExpressionParser);
    this.setPlugin(NthChildExpressionParser);
  }
}
