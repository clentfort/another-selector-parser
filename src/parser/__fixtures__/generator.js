/* @flow */

import Tokenizer from '../../tokenizer';
import Parser from '../';

function parse(input) {
  return new Parser(new Tokenizer(input)).parse();
}

export default function generate(input: string): string {
  return JSON.stringify(parse(input), null, 2);
}
