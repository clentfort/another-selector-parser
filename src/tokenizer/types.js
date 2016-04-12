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
  dot: new TokenType('.'),
  hash: new TokenType('#'),
  minus: new TokenType('-'),
  parenL: new TokenType('('),
  parenR: new TokenType(')'),
  pipe: new TokenType('|'),
  percentage: new TokenType('%'),
  plus: new TokenType('+'),
  star: new TokenType('*'),

  combinator: new TokenType('combinator'),
  attrMatcher: new TokenType('_='),

  ident: new TokenType('ident'),
  name: new TokenType('name'),
  num: new TokenType('num'),
  string: new TokenType('string'),
  whitespace: new TokenType('whitespace'),

  eof: new TokenType('EOF'),
};
