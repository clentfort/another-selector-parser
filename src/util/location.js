/* @flow */
export class Position {
  line: number;
  column: number;

  constructor(line: number, column: number) {
    this.column = column;
    this.line = line;
  }

  clone(): Position {
    return new Position(this.line, this.column);
  }
}

export class SourceLocation {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }

  clone(): SourceLocation {
    return new SourceLocation(this.start.clone(), this.end.clone());
  }
}
