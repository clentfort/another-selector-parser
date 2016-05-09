/* @flow */
import type { Token } from '../tokenizer/tokens';

type ShouldStopAt = (token: Token) => boolean;

export type Context = {
  [key: string]: any;
  emitWhitespace: boolean;
  name: string;
  shouldStopAt: ShouldStopAt;
};

export type PartialContext = {
  [key: string]: any;
  name: string;
};
