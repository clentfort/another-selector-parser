/* @flow */

export type TokenType =
  'bracketL' |
  'bracketR' |
  'colon' |
  'comma' |
  'dot' |
  'hash' |
  'minus' |
  'parenL' |
  'parenR' |
  'percentage' |
  'pipe' |
  'plus' |
  'star' |
  'matcher' |
  'combinator' |
  'ident' |
  'num' |
  'string' |
  'whitespace' |
  'EOF';

export type Token =
  { type: 'EOF'; start: number; end: number; value: string; } |
  { type: 'bracketL'; start: number; end: number; } |
  { type: 'bracketR'; start: number; end: number; } |
  { type: 'colon'; start: number; end: number; } |
  { type: 'combinator'; start: number; end: number; value: '>' | '~'; } |
  { type: 'comma'; start: number; end: number; } |
  { type: 'dot'; start: number; end: number; } |
  { type: 'hash'; start: number; end: number; } |
  { type: 'ident'; start: number; end: number; value: string; } |
  { type: 'matcher'; start: number; end: number; value: '=' | '~=' | '|=' | '^=' | '$=' | '*='; } |
  { type: 'minus'; start: number; end: number; } |
  { type: 'num'; start: number; end: number; value: number; } |
  { type: 'parenL'; start: number; end: number; } |
  { type: 'parenR'; start: number; end: number; } |
  { type: 'percentage'; start: number; end: number; } |
  { type: 'pipe'; start: number; end: number; } |
  { type: 'plus'; start: number; end: number; } |
  { type: 'star'; start: number; end: number; } |
  { type: 'string'; start: number; end: number; value: string; } |
  { type: 'whitespace'; start: number; end: number; value: string; };
