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
  parenL: new TokenType('('),
  parenR: new TokenType(')'),
  percentage: new TokenType('%'),
  pipe: new TokenType('|'),
  plus: new TokenType('+'),
  star: new TokenType('*'),

  attrMatcher: new TokenType('_='),
  combinator: new TokenType('combinator'),
  hash: new TokenType('#'),
  ident: new TokenType('ident'),
  num: new TokenType('num'),
  string: new TokenType('string'),
  whitespace: new TokenType('whitespace'),

  eof: new TokenType('EOF'),
};
