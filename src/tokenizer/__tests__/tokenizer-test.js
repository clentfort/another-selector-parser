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

  describe('simple tokens', () => {
    // Map of tokens to expected Token-Object
    const tokens = {
      '[': { type: 'bracketL', start: 0, end: 1 },
      ']': { type: 'bracketR', start: 0, end: 1 },
      ':': { type: 'colon', start: 0, end: 1 },
      ',': { type: 'comma', start: 0, end: 1 },
      ".": { type: 'dot', start: 0, end: 1 },
      '#': { type: 'hash', start: 0, end: 1 },
      '(': { type: 'parenL', start: 0, end: 1 },
      ')': { type: 'parenR', start: 0, end: 1 },
      '%': { type: 'percentage', start: 0, end: 1 },
      '|': { type: 'pipe', start: 0, end: 1 },
      '-': { type: 'minus', start: 0, end: 1 },
      '+': { type: 'plus', start: 0, end: 1 },
      '*': { type: 'star', start: 0, end: 1 },
      '>': { type: 'combinator', value: '>', start: 0, end: 1 },
      '~': { type: 'combinator', value: '~', start: 0, end: 1 },
      '=': { type: 'matcher', value: '=', start: 0, end: 1 },
      '$=': { type: 'matcher', value: '$=', start: 0, end: 2 },
      '*=': { type: 'matcher', value: '*=', start: 0, end: 2 },
      '^=': { type: 'matcher', value: '^=', start: 0, end: 2 },
      '|=': { type: 'matcher', value: "|=", start: 0, end: 2 },
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
      expect(() => tokenize('!').next()).toThrow();
    });
  });

  describe('ids', () => {
    it('parses idents', () => {
      const input = 'someid';
      expect(tokenize(input).next().value).toEqual({
        type: 'ident',
        value: 'someid',
        start: 0,
        end: input.length,
      });
    });

    it('parses idents with escaped tokens', () => {
      const input = '\\41-';
      expect(tokenize(input).next().value).toEqual({
        type: 'ident',
        value: `${String.fromCodePoint(0x41)}-`,
        start: 0,
        end: 4,
        start: 0,
        end: input.length,
      });
    });
  });

  describe('comments', () => {
    it('ignores any comments', () => {
      const input = '/*abc*//*2*/';
      let { value, done } = tokenize(input).next();
      expect(done).toBe(false);
      expect(value).toEqual({ 
        type: 'EOF', 
        start: input.length, 
        end: input.length + 1,
      });
    });

    it('throws on unfinished comments', () => {
      expect(() => tokenize('/* unfinished comment').next()).toThrow();
    });
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

  describe('string', () => {
    it('throws on unclosed strings', () => {
      expect(() => tokenize(`"unclosed string`).next()).toThrow();
      expect(() => tokenize(`'unclosed string`).next()).toThrow();
      expect(() => tokenize(`"unclosed multiline string\n`).next()).toThrow();
      expect(() => tokenize(`'unclosed multiline string\n`).next()).toThrow();
    });

    it('reads correctly quoted strings', () => {
      let input = `'a string'`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: 'a string',
        start: 0,
        end: input.length,
      });

      input = `"a string"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: 'a string',
        start: 0,
        end: input.length,
      });
    });

    it('reads escaped hex-codes', () => {
      let input = `"\\1"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x1),
        start: 0,
        end: input.length,
      });

      // Stops on first non hex-digit
      input = `"\\1X"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: `${String.fromCodePoint(0x1)}X`,
        start: 0,
        end: input.length,
      });

      input = `"\\01"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x01),
        start: 0,
        end: input.length,
      });

      input = `"\\001"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x001),
        start: 0,
        end: input.length,
      });

      input = `"\\0001"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x0001),
        start: 0,
        end: input.length,
      });

      input = `"\\00001"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x00001),
        start: 0,
        end: input.length,
      });

      input = `"\\000001"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: String.fromCodePoint(0x000001),
        start: 0,
        end: input.length,
      });

      // Max 6 Hex digits
      input = `"\\000001A"`;
      expect(tokenize(input).next().value).toEqual({
        type: 'string',
        value: `${String.fromCodePoint(0x000001)}A`,
        start: 0,
        end: input.length,
      });
    });

    it('eats a single whitespace following a hex-escape sequence', () => {
      let input = '"\\49 "';
      let tokenizer = tokenize(input);
      expect(tokenizer.next().value).toEqual({ 
        type: 'string',
        value: String.fromCodePoint(0x49),
        start: 0,
        end: input.length,
      });

      input = '"\\49 X"';
      tokenizer = tokenize(input);
      expect(tokenizer.next().value).toEqual({ 
        type: 'string',
        value: `${String.fromCodePoint(0x49)}X`,
        start: 0,
        end: input.length,
      });

      input = '"\\49  "';
      tokenizer = tokenize(input);
      expect(tokenizer.next().value).toEqual({
        type: 'string',
        value: `${String.fromCodePoint(0x49)} `,
        start: 0,
        end: input.length,
      });

      input = '"\\49  X"';
      tokenizer = tokenize(input);
      expect(tokenizer.next().value).toEqual({
        type: 'string',
        value: `${String.fromCodePoint(0x49)} X`,
        start: 0,
        end: input.length,
      });
    });
  });

  describe('numbers', () => {
    it('parses integers', () => {
      const input = '123456789';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 123456789,
        start: 0,
        end: input.length,
      });
    });

    it('parses floats', () => {
      let input = '1.0';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1.0,
        start: 0,
        end: input.length,
      });

      input = '.1';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: .1,
        start: 0,
        end: input.length,
      });

      input = '1e10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1e10,
        start: 0,
        end: input.length,
      });

      input = '1e+10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1e+10,
        start: 0,
        end: input.length,
      });

      input = '1e-10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1e-10,
        start: 0,
        end: input.length,
      });

      input = '1E10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1E10,
        start: 0,
        end: input.length,
      });

      input = '1.5e10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1.5e10,
        start: 0,
        end: input.length,
      });

      input = '1.5e+10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1.5e+10,
        start: 0,
        end: input.length,
      });

      input = '1.5e-10';
      expect(tokenize(input).next().value).toEqual({
        type: 'num',
        value: 1.5e-10,
        start: 0,
        end: input.length,
      });
    });
  });
});
