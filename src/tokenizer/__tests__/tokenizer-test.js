'use strict';

jest.disableAutomock();

import tokenize from '../';
import { types as tt } from '../types';

describe('tokenize', () => {
  describe('EOF', () => {
    it('returns EOF for empty input', () => {
      const { value, done } = tokenize('').next();
      expect(done).toBe(false);
      expect(value).toEqual({ type: 'EOF', start: 0, end: 1 });
    });

    it('is down after returning EOF', () => {
      const tokenizer = tokenize('');
      tokenizer.next();
      expect(tokenizer.next().done).toBe(true);
    });
  });

  it('throws on incomplete attribute matchers', () => {
    expect(() => tokenize('$').next()).toThrow();
  });

  it('throws on unknown tokens', () => {
    expect(() => tokenize('!').next()).toThrow();
  });

  it('throws on unfinished comments', () => {
    expect(() => tokenize('/* unfinished comment').next()).toThrow();
  });

  it('throws on unclosed strings', () => {
    expect(() => tokenize(`"unclosed string`).next()).toThrow();
    expect(() => tokenize(`'unclosed string`).next()).toThrow();
    expect(() => tokenize(`"unclosed multiline string\n`).next()).toThrow();
    expect(() => tokenize(`'unclosed multiline string\n`).next()).toThrow();
  });

  describe('whitespace', () => {
    it('reads whitespace', () => {
      const input = '      ';
      let { value } = tokenize(input).next();
      expect(value).toEqual({ type: 'whitespace', start: 0, end: input.length });
    });

    it('reads whitespace with a trailing comment', () => {
      const input = '  /* comment */';
      let { value, done } = tokenize(input).next();
      expect(value).toEqual({ type: 'whitespace', start: 0, end: input.length});
      expect(done).toBe(false);
    });

    it('read whitespace with a comment', () => {
      const input = ' /* comment */ ';
      const tokenizer = tokenize(input);
      let { value, done } = tokenizer.next();
      expect(value).toEqual({ type: 'whitespace', start: 0, end: input.length });
      expect(done).toBe(false);
      expect(tokenizer.next().value).toEqual({ 
        type: 'EOF', 
        start: input.length, 
        end: input.length + 1,
      });
    });
  });
});
