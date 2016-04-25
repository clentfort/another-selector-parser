'use strict';

jest.disableAutomock();

import Tokenizer from '../';
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
  if (value != undefined) {
    result.value = value;
  }

  return result;
}

describe('Tokenizer', () => {
  describe('EOF', () => {
    it('returns EOF for empty input', () => {
      const token = (new Tokenizer('')).nextToken();
      expect(token).toEqual(createToken('EOF'));
    });
  });

  it('throws on incomplete attribute matchers', () => {
    expect(() => (new Tokenizer('$')).nextToken()).toThrow();
  });

  it('throws on unknown tokens', () => {
    expect(() => (new Tokenizer('!')).nextToken()).toThrow();
  });

  it('throws on unfinished comments', () => {
    expect(() => (new Tokenizer('/* unfinished comment')).nextToken()).toThrow();
  });

  it('throws on unclosed strings', () => {
    expect(() => (new Tokenizer(`"unclosed string`)).nextToken()).toThrow();
    expect(() => (new Tokenizer(`'unclosed string`)).nextToken()).toThrow();
    expect(() => (new Tokenizer(`"unclosed multiline string\n`)).nextToken()).toThrow();
    expect(() => (new Tokenizer(`'unclosed multiline string\n`)).nextToken()).toThrow();
  });

  describe('peek and backup', () => {
    it('throws when trying to peek twice', () => {
      const tokenizer = new Tokenizer('Some Input');
      tokenizer.peek();
      expect(() => tokenizer.peek()).toThrow();
    });

    it('throws when trying to backup when not peeking', () => {
      const tokenizer = new Tokenizer('Some Input');
      expect(() => tokenizer.backup()).toThrow();

      tokenizer.peek();
      expect(() => tokenizer.backup()).not.toThrow();
      expect(() => tokenizer.backup()).toThrow();
    });

    it('returns to the original state when done peeking', () => {
      const tokenizer = new Tokenizer('Some Input');
      tokenizer.peek();
      expect(tokenizer.nextToken()).toEqual(createToken(
        'ident', null, 'Some', 1, 4
      ));
      tokenizer.backup();
      expect(tokenizer.nextToken()).toEqual(createToken(
        'ident', null, 'Some', 1, 4
      ));
    });
  });

  describe('whitespace', () => {
    it('reads whitespace', () => {
      const input = '      ';
      let value = (new Tokenizer(input)).nextToken();
      expect(value).toEqual(createToken('whitespace', input));
    });

    it('reads whitespace with a trailing comment', () => {
      const input = '  /* comment */';
      let token = (new Tokenizer(input)).nextToken();
      expect(token).toEqual(createToken('whitespace', input));
    });

    it('read whitespace with a comment', () => {
      const input = ' /* comment */ ';
      const tokenizer = new Tokenizer(input);
      let token = tokenizer.nextToken();
      expect(token).toEqual(createToken('whitespace', input));
      const eof = tokenizer.nextToken()
      expect(eof.type).toEqual('EOF'); 
      expect(eof.loc.end.column).toEqual(input.length + 1); 
    });
  });
});
