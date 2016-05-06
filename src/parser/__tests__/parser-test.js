jest.disableAutomock();

import Parser from '../';
import Tokenizer from '../../tokenizer';

function P(input) {
  const p = new Parser(new Tokenizer(input));
  p.pushContext({ 
    name: 'test', 
    emitWhitespace: true,
    shouldStopA: token => token.type === 'EOF',
  });
  return p;
}

describe('Parser', () => {
  describe('SimpleSelectors', () => {
    it('throws when parsing a selector starting with an unknown symbol', () => {
      expect(() => { P('&input').parseSimpleSelector() }).toThrow();
    });

    it('throws when parsing an attribute-selector not starting with a bracketL', () => {
      expect(() => { P('input').parseAttributeSelector() }).toThrow();
    });

    it('throws when parsing a pseudo-selector starting not starting with a colon', () => {
      expect(() => { P('input').parsePseudoSelector() }).toThrow();
    });

    it('throws when parsing a class-selector starting not starting with a dot', () => {
      expect(() => { P('input').parseClassSelector() }).toThrow();
    });

    it('throws when parsing a hash-selector starting not starting with a colon', () => {
      expect(() => { P('input').parseHashSelector() }).toThrow();
    });
  })

  it('throws when parsing an invalid combinator', () => {
    expect(() => { P('.').parseCombinator() }).toThrow();
  });

  it('throws when parsing an invalid identifier', () => {
      expect(() => { P('.').parseIdentifier() }).toThrow();
  });

  it('throws when parsing an invalid string-literal', () => {
      expect(() => { P('literal').parseStringLiteral() }).toThrow();
  });

  it('throws when parsing an invalid number-literal', () => {
      expect(() => { P('literal').parseNumberLiteral() }).toThrow();
  });

  describe('context', () => {
    it('throws when trying to pop a context when the current context has a different name', () => {
      const p = new Parser(new Tokenizer('some input'));
      p.pushContext({ name: 'a' });
      expect(() => p.popContext('b')).toThrow();
    });
  });
});
