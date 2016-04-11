/* @flow */
export class TokenType {
  label: string;

  constructor(label: string) {
    this.label = label;
  }
}

export const types = {
  bracketL: new TokenType('['),
  bracketR: new TokenType(']'),
  colon: new TokenType(':'),
  comma: new TokenType(','),
  dashmatch: new TokenType('|='),
  dot: new TokenType('.'),
  greater: new TokenType('>'),
  hash: new TokenType('#'),
  ident: new TokenType('ident'),
  includes: new TokenType('~='),
  num: new TokenType('num'),
  parenL: new TokenType('('),
  parenR: new TokenType(')'),
  percentage: new TokenType('%'),
  plus: new TokenType('+'),
  prefixmatch: new TokenType('^='),
  string: new TokenType('string'),
  substringmatch: new TokenType('*='),
  suffixmatch: new TokenType('$='),
  tilde: new TokenType('~'),
  whitespace: new TokenType('whitespace'),
  eof: new TokenType('EOF'),
};
