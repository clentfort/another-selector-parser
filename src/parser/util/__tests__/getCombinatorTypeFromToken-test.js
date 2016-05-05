jest.disableAutomock();

import getCombinatorTypeFromToken from '../getCombinatorTypeFromToken';

describe('getCombinatorTypeFromToken', () => {
  it(`returns 'descendant' for whitespace-tokens`, () => {
    expect(getCombinatorTypeFromToken({ type: 'whitespace' })).toBe('descendant');
  });

  it(`returns 'sibling-next' for plus-tokens`, () => {
    expect(getCombinatorTypeFromToken({ type: 'plus' })).toBe('sibling-next');
  });

  it(`returns 'sibling-following' for combinator-token with a value of '~'`, () => {
    expect(getCombinatorTypeFromToken({ type: 'combinator', value: '~' })).toBe('sibling-following');
  });
  
  it(`returns 'child' for combinator-token with a value of '>'`, () => {
    expect(getCombinatorTypeFromToken({ type: 'combinator', value: '>' })).toBe('child');
  });

  it(`returns 'descendant' for combinator-token with a value of '>>'`, () => {
    expect(getCombinatorTypeFromToken({ type: 'combinator', value: '>>' })).toBe('descendant');
  });

  it('throws on unknown tokens', () => {
    expect(() => getCombinatorTypeFromToken({ type: 'dot' })).toThrow();
  });
});
