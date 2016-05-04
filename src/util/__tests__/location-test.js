jest.disableAutomock();

import { Position, SourceLocation } from '../location';

describe('Position', () => {
  const line = 10;
  const column = 5;

  it('creates a new instance with line and column set', () => {
    const p = new Position(line, column);
    expect(p instanceof Position).toBe(true);

    expect(p.line).toBe(line);
    expect(p.column).toBe(column);
  });

  it('clones the instance', () => {
    const p = new Position(line, column);
    const c = p.clone();

    expect(p).toEqual(c);
    expect(p).not.toBe(c);
  });
});

describe('SourceLocation', () => {
  const start = new Position(0, 0);
  const end = new Position(10, 50);

  it('creates a new instance with start and end set', () => {
    const loc = new SourceLocation(start, end);
    expect(loc instanceof SourceLocation).toBe(true);

    expect(loc.start).toBe(start);
    expect(loc.end).toBe(end);
  });

  it('clones the instance and the position', () => {
    const loc = new SourceLocation(start, end);
    const c = loc.clone();

    expect(loc).toEqual(c);
    expect(loc).not.toBe(c);
    expect(c.start).not.toBe(start);
    expect(c.end).not.toBe(end);
  });
});
