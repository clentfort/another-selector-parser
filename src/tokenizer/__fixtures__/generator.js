/* @flow */

import Tokenizer from '../';

export default function generate(input: string): string {
  const tokenizer = new Tokenizer(input);
  const tokens = [];
  let token;
  for (
    token = tokenizer.nextToken();
    token.type !== 'EOF';
    token = tokenizer.nextToken()
  ) {
    tokens.push(token);
  }
  tokens.push(token);
  return JSON.stringify(tokens, null, 2);
}
