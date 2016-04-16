/* @flow */

import parse from '../';

export default function generate(input: string): string {
  return JSON.stringify(parse(input), null, 2);
}
