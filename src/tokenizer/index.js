/* @flow */
import { types as tt } from './types';

import type { TokenType } from './types';

type Token = {
  type: TokenType;
  value?: any;
};

export default function *tokenize(input: string): Generator<Token, Token, void> {
  // Current position in the input string
  let position = 0;

  while (position < input.length) {
    // Current char we are looking at
    let currentChar = input[position];

    let wasWhitespace = false;
    if (isWhitespace(currentChar)) {
      currentChar = input[++position];
      while (isWhitespace(currentChar)) {
        currentChar = input[++position];
      }
      yield { type: tt.whitespace };
      // No continue needed here since we consumed all whitespace and a guaranteed to find something meaningful now
    }

    if (currentChar === '/') {
      currentChar = input[++position];
      if (currentChar === '*') {
        // Inside a comment
        console.log('Inside a comment');
        currentChar = input[++position];
        let nextChar = input[position + 1];
        console.log('Current Char', currentChar);
        console.log('Next Char', nextChar);
        console.log('Start while');
        while (!(currentChar === '*' && nextChar === '/')) {
          currentChar = input[++position];
          nextChar = input[position + 1];
          console.log('Current Char', currentChar);
          console.log('Next Char', nextChar);
        }
        console.log('End while');
        currentChar = input[position + 2];
        position += 2;
        console.log('Current Char', currentChar);
      } else {
        throw new UnexpectedCharacterError('/', currentChar);
      }
    }

    if (currentChar === '[') {
      yield { type: tt.bracketL };
      ++position;
      continue;
    }

    if (currentChar === ']') {
      yield { type: tt.bracketR };
      ++position;
      continue;
    }

    if (currentChar === ':') {
      yield { type: tt.colon };
      ++position;
      continue;
    }

    if (currentChar === ',') {
      yield { type: tt.comma };
      ++position;
      continue;
    }

    if (currentChar === '.') {
      yield { type: tt.dot };
      ++position;
      continue;
    }

    if (currentChar === '>') {
      yield { type: tt.greater };
      ++position;
      continue;
    }

    if (currentChar === '#') {
      yield { type: tt.hash };
      ++position;
      continue;
    }

    if (currentChar === '(') {
      yield { type: tt.parenL };
      ++position;
      continue;
    }

    if (currentChar === ')') {
      yield { type: tt.parenR };
      ++position;
      continue;
    }

    if (currentChar === '%') {
      yield { type: tt.percentage };
      ++position;
      continue;
    }

    if (currentChar === '+') {
      yield { type: tt.plus };
      ++position;
      continue;
    }

    if (currentChar === '~') {
      yield { type: tt.tilde };
      ++position;
      continue;
    }

    if (currentChar === '|') {
      currentChar= input[++position];
      if (currentChar === '=') {
        yield { type: tt.dashmatch };
        ++position;
        continue;
      } else {
        throw new UnexpectedCharacterError(currentChar, '=');
      }
    }

    if (currentChar === '~') {
      currentChar= input[++position];
      if (currentChar === '=') {
        yield { type: tt.includes };
        ++position;
        continue;
      } else {
        throw new UnexpectedCharacterError(currentChar, '=');
      }
    }

    if (currentChar === '^') {
      currentChar= input[++position];
      if (currentChar === '=') {
        yield { type: tt.prefixmatch };
        ++position;
        continue;
      } else {
        throw new UnexpectedCharacterError(currentChar, '=');
      }
    }

    if (currentChar === '*') {
      currentChar= input[++position];
      if (currentChar === '=') {
        yield { type: tt.substringmatch };
        ++position;
        continue;
      } else {
        throw new UnexpectedCharacterError(currentChar, '=');
      }
    }

    if (currentChar === '$') {
      currentChar= input[++position];
      if (currentChar === '=') {
        yield { type: tt.suffixmatch };
        ++position;
        continue;
      } else {
        throw new UnexpectedCharacterError(currentChar, '=');
      }
    }

  }

  return {
    type: tt.eof,
  };
}

function isWhitespace(char: string) {
  return (char === ' ' || char === "\t" || char === "\r" || char === "\n" || char === "\f");
}


class UnexpectedCharacterError extends Error {
  constructor(actual, expected) {
    super(`Unexpected char "${actual}", expected "${expected}".`);
  }
}

class UnexpectedEofError extends Error {
  constructor(expected) {
    super(`Unexpected end of input, expected "${expected}".`);
  }
}
