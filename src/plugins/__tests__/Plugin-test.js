jest.disableAutomock();

import Plugin from '../Plugin';

describe('Plugin', () => {
  it('throws when invoking `parse` method on an instance of plugin', () => {
    var p = new Plugin({});
    expect(() => p.parse()).toThrow();
  });

  it('throws when invoking static `getNewAstNodes` method on plugin', () => {
    expect(() => Plugin.getNewAstNodes()).toThrow();
  });

  it('throws when invoking static `getTargetNode` method on plugin', () => {
    expect(() => Plugin.getTargetNode()).toThrow();
  });

  it('throws when invoking static `getTargetExpression` method on plugin', () => {
    expect(() => Plugin.getTargetExpression()).toThrow();
  });
});
