/* @flow */

import type { SourceLocation } from '../util/location';

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
  { type: 'EOF'; loc: ?SourceLocation; value: string; } |
  { type: 'bracketL'; loc: ?SourceLocation; } |
  { type: 'bracketR'; loc: ?SourceLocation; } |
  { type: 'colon'; loc: ?SourceLocation; } |
  { type: 'combinator'; loc: ?SourceLocation; value: '>' | '>>' | '~'; } |
  { type: 'comma'; loc: ?SourceLocation; } |
  { type: 'dot'; loc: ?SourceLocation; } |
  { type: 'hash'; loc: ?SourceLocation; } |
  { type: 'ident'; loc: ?SourceLocation; value: string; } |
  { type: 'matcher'; loc: ?SourceLocation; value: '=' | '~=' | '|=' | '^=' | '$=' | '*='; } |
  { type: 'minus'; loc: ?SourceLocation; } |
  { type: 'num'; loc: ?SourceLocation; value: number; } |
  { type: 'parenL'; loc: ?SourceLocation; } |
  { type: 'parenR'; loc: ?SourceLocation; } |
  { type: 'percentage'; loc: ?SourceLocation; } |
  { type: 'pipe'; loc: ?SourceLocation; } |
  { type: 'plus'; loc: ?SourceLocation; } |
  { type: 'star'; loc: ?SourceLocation; } |
  { type: 'string'; loc: ?SourceLocation; value: string; } |
  { type: 'whitespace'; loc: ?SourceLocation; };
