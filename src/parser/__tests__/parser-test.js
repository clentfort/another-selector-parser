jest.disableAutomock();

import Parser from '../';
import Tokenizer from '../../tokenizer';

function P(input) {
  return new Parser(new Tokenizer(input));
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

  it('throws when parsing an invalid identifier', () => {
      expect(() => { P('.').parseIdentifier() }).toThrow();
  });

  it('throws when parsing an invalid string-literal', () => {
      expect(() => { P('literal').parseStringLiteral() }).toThrow();
  });
});
