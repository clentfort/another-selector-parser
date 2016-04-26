/* @flow */
import { Combinator, CombinatorOperator } from '../nodes/';
import type { Token } from '../../tokenizer/tokens';

export default function getCombinatorTypeFromToken(
  token: Token
): Combinator {
  let value;
  switch (token.type) {
    case 'whitespace':
      value = new CombinatorOperator('whitespace');
      break;
    case 'plus':
      value = new CombinatorOperator('+');
      break;
    case 'combinator':
      value = new CombinatorOperator(token.value);
      break;
    default:
      throw new Error();
  }
  return new Combinator(value);
}
