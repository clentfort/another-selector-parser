jest.disableAutomock();

import Plugin from '../Plugin';

describe('Plugin', () => {
  it('throws when invoking the parse method directly on the plugin', () => {
    var p = new Plugin({});
    expect(() => p.parse()).toThrow();
  });
});
