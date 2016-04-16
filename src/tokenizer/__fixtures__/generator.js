/* @flow */

import tokenize from '../';

export default function generate(input: string): string {
  const tokens = [];
  for (const token of tokenize(input)) {
    tokens.push(token);
  }
  return JSON.stringify(tokens, null, 2);
}
