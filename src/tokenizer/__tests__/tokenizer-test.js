'use strict';

jest.disableAutomock();

import tokenize from '../';
import { types as tt } from '../tokens';

function createToken(
  type,
  input,
  value,
  endLine = 1,
  endCol = input && input.length || 1,
  startLine = 1,
  startCol = 0
  ) {
  const result = {
    type,
    loc: {
      start: { line: startLine, column: startCol, },
      end: { line: endLine, column: endCol }
    }
  }
  if (value) {
    result.value = value;
  }

  return result;
}

describe('tokenize', () => {
  describe('EOF', () => {
    it('returns EOF for empty input', () => {
      const { value, done } = tokenize('').next();
      expect(done).toBe(false);
      expect(value).toEqual(createToken('EOF'));
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
      expect(value).toEqual(createToken('whitespace', input));
    });

    it('reads whitespace with a trailing comment', () => {
      const input = '  /* comment */';
      let { value, done } = tokenize(input).next();
      expect(value).toEqual(createToken('whitespace', input));
      expect(done).toBe(false);
    });

    it('read whitespace with a comment', () => {
      const input = ' /* comment */ ';
      const tokenizer = tokenize(input);
      let { value, done } = tokenizer.next();
      expect(value).toEqual(createToken('whitespace', input));
      expect(done).toBe(false);
      const eof = tokenizer.next().value;
      expect(eof.type).toEqual('EOF'); 
      expect(eof.loc.end.column).toEqual(input.length + 1); 
    });
  });
});
