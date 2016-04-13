jest.disableAutomock();

import tokenize from '../';
import { types as tt } from '../types';

describe('tokenize', () => {
  describe('EOF', () => {
    it('returns EOF for empty input', () => {
      const { value, done } = tokenize('').next();
      expect(done).toBe(false);
      expect(value).toEqual({ type: tt.eof });
    });

    it('is down after returning EOF', () => {
      const tokenizer = tokenize('');
      tokenizer.next();
      expect(tokenizer.next().done).toBe(true);
    });
  });

  describe('simple tokens', () => {
    // Map of tokens to expected Token-Object
    const tokens = {
      '[': { type: tt.bracketL },
      ']': { type: tt.bracketR },
      ':': { type: tt.colon },
      ',': { type: tt.comma },
      ".": { type: tt.dot },
      '(': { type: tt.parenL },
      ')': { type: tt.parenR },
      '%': { type: tt.percentage },
      '|': { type: tt.pipe },
      '+': { type: tt.plus },
      '*': { type: tt.star },
      '>': { type: tt.combinator, value: '>' },
      '~': { type: tt.combinator, value: '~' },
      '=': { type: tt.attrMatcher, value: '=' },
      '$=': { type: tt.attrMatcher, value: '$=' },
      '*=': { type: tt.attrMatcher, value: '*=' },
      '^=': { type: tt.attrMatcher, value: '^=' },
      '|=': { type: tt.attrMatcher, value: "|=" },
    };

    // Test valid tokens
    Object.keys(tokens).forEach(token => {
      it(`parses "${token}"`, () => {
        expect(tokenize(token).next().value).toEqual(tokens[token]);
      });
    });

    // Test for unfinished attribute matcher
    it('throws on incomplete attribute matchers', () => {
      expect(() => tokenize('$').next()).toThrow();
    });

    it('throws on unknown tokens', () => {
      expect(() => tokenize('-').next()).toThrow();
    });
  });

  describe('ids', () => {
    it('parses hashs', () => {
      expect(tokenize('#someid').next().value).toEqual({
        type: tt.hash,
        value: 'someid',
      });
    });

    it('parses hashs with escaped tokens', () => {
      expect(tokenize('#\\41-').next().value).toEqual({
        type: tt.hash,
        value: `${String.fromCodePoint(0x41)}-`,
      });
    });
  });

  describe('comments', () => {
    it('ignores any comments', () => {
      let { value, done } = tokenize('/*abc*//*2*/').next();
      expect(done).toBe(false);
      expect(value).toEqual({ type: tt.eof });
    });

    it('throws on unfinished comments', () => {
      expect(() => tokenize('/* unfinished comment').next()).toThrow();
    });
  });

  describe('whitespace', () => {
    it('reads whitespace', () => {
      let { value } = tokenize('     ').next();
      expect(value).toEqual({ type: tt.whitespace });
    });

    it('reads whitespace with a trailing comment', () => {
      let { value, done } = tokenize('  /* comment after whitespace */').next();
      expect(value).toEqual({ type: tt.whitespace });
      expect(done).toBe(false);
    });

    it('read whitespace with a comment', () => {
      const tokenizer = tokenize(' /* comment */ ');
      let { value, done } = tokenizer.next();
      expect(value).toEqual({ type: tt.whitespace });
      expect(done).toBe(false);
      expect(tokenizer.next().value).toEqual({ type: tt.eof });
    });
  });

  describe('string', () => {
    it('throws on unclosed strings', () => {
      expect(() => tokenize(`"unclosed string`).next()).toThrow();
      expect(() => tokenize(`'unclosed string`).next()).toThrow();
      expect(() => tokenize(`"unclosed multiline string\n`).next()).toThrow();
      expect(() => tokenize(`'unclosed multiline string\n`).next()).toThrow();
    });

    it('reads correctly quoted strings', () => {
      expect(tokenize(`'a string'`).next().value).toEqual({
        type: tt.string,
        value: 'a string',
      });

      expect(tokenize(`"a string"`).next().value).toEqual({
        type: tt.string,
        value: 'a string',
      });
    });

    it('reads escaped hex-codes', () => {
      expect(tokenize(`"\\1"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x1),
      });

      // Stops on first non hex-digit
      expect(tokenize(`"\\1X"`).next().value).toEqual({
        type: tt.string,
        value: `${String.fromCodePoint(0x1)}X`,
      });

      expect(tokenize(`"\\01"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x01),
      });

      expect(tokenize(`"\\001"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x001),
      });

      expect(tokenize(`"\\0001"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x0001),
      });

      expect(tokenize(`"\\00001"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x00001),
      });

      expect(tokenize(`"\\000001"`).next().value).toEqual({
        type: tt.string,
        value: String.fromCodePoint(0x000001),
      });

      // Max 6 Hex digits
      expect(tokenize(`"\\000001A"`).next().value).toEqual({
        type: tt.string,
        value: `${String.fromCodePoint(0x000001)}A`,
      });
    });

    it('eats a single whitespace following a hex-escape sequence', () => {
      let tokenizer = tokenize('"\\49 "');
      expect(tokenizer.next().value).toEqual({ 
        type: tt.string,
        value: String.fromCodePoint(0x49),
      });

      tokenizer = tokenize('"\\49 X"');
      expect(tokenizer.next().value).toEqual({ 
        type: tt.string,
        value: `${String.fromCodePoint(0x49)}X`,
      });

      tokenizer = tokenize('"\\49  "');
      expect(tokenizer.next().value).toEqual({
        type: tt.string,
        value: `${String.fromCodePoint(0x49)} `,
      });

      tokenizer = tokenize('"\\49  X"');
      expect(tokenizer.next().value).toEqual({
        type: tt.string,
        value: `${String.fromCodePoint(0x49)} X`,
      });
    });
  });

  describe('numbers', () => {
    it('parses integers', () => {
      expect(tokenize('123456789').next().value).toEqual({
        type: tt.num,
        value: 123456789,
      });
    });

    it('parses negative integers', () => {
      expect(tokenize('-10').next().value).toEqual({
        type: tt.num,
        value: -10,
      });
    });

    it('parses floats', () => {
      expect(tokenize('1.0').next().value).toEqual({
        type: tt.num,
        value: 1.0,
      });

      expect(tokenize('+1.0').next().value).toEqual({
        type: tt.num,
        value: 1.0,
      });

      expect(tokenize('.1').next().value).toEqual({
        type: tt.num,
        value: .1,
      });

      expect(tokenize('+.1').next().value).toEqual({
        type: tt.num,
        value: .1,
      });

      expect(tokenize('1e10').next().value).toEqual({
        type: tt.num,
        value: 1e10,
      });

      expect(tokenize('1e+10').next().value).toEqual({
        type: tt.num,
        value: 1e+10,
      });
      
      expect(tokenize('1e-10').next().value).toEqual({
        type: tt.num,
        value: 1e-10,
      });

      expect(tokenize('1E10').next().value).toEqual({
        type: tt.num,
        value: 1E10,
      });

      expect(tokenize('1.5e10').next().value).toEqual({
        type: tt.num,
        value: 1.5e10,
      });

      expect(tokenize('1.5e+10').next().value).toEqual({
        type: tt.num,
        value: 1.5e+10,
      });
      
      expect(tokenize('1.5e-10').next().value).toEqual({
        type: tt.num,
        value: 1.5e-10,
      });
    });

    it('parses negative floats', () => {
      expect(tokenize('-1.0').next().value).toEqual({
        type: tt.num,
        value: -1.0,
      });

      expect(tokenize('-.1').next().value).toEqual({
        type: tt.num,
        value: -.1,
      });

      expect(tokenize('-.1e1').next().value).toEqual({
        type: tt.num,
        value: -.1e1,
      });

      expect(tokenize('-.1e+1').next().value).toEqual({
        type: tt.num,
        value: -.1e+1,
      });

      expect(tokenize('-.1e-1').next().value).toEqual({
        type: tt.num,
        value: -.1e-1,
      });
    });
  });
});
