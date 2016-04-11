jest.unmock('../');
jest.unmock('../types');

import tokenize from '../';
import { types as tt } from '../types';

describe('tokenize', () => {
  it('returns EOF for empty input', () => {
    const { value, done } = tokenize('').next();
    expect(done).toBe(true);
    expect(value).toEqual({ type: tt.eof });
  });

  it('is down after returning EOF', () => {
    const tokenizer = tokenize('');
    tokenizer.next();
    expect(tokenizer.next().done).toBe(true);
  });

  it('ignores any comments', () => {
    let { value, done } = tokenize('/*abc*/').next();
    expect(done).toBe(true);
    expect(value).toEqual({ type: tt.eof });
  });
});
