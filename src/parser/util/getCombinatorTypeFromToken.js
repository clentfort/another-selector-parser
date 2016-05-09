/* @flow */
import AnotherSelectorParserError from '../../util/Error';

import type { Token } from '../../tokenizer/tokens';
import type { CombinatorType } from '../../util/nodes/Combinator';

export class UnknownCombinatorTypeValue extends AnotherSelectorParserError {
  constructor() {
    super('Encountered unknown combinator type');
  }
}

export default function getCombinatorTypeFromToken(
  token: Token
): CombinatorType {
  if (token.type === 'plus') {
    return 'sibling-next';
  } else if (token.type === 'whitespace') {
    return 'descendant';
  } else if (token.type === 'combinator') {
    if (token.value === '~') {
      return 'sibling-following';
    } else if (token.value === '>') {
      return 'child';
    } else if (token.value === '>>') {
      return 'descendant';
    }
  }
  throw new UnknownCombinatorTypeValue();
}
