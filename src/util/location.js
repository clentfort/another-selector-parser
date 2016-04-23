/* @flow */
export class Position {
  line: number;
  column: number;

  constructor(line: number, column: number) {
    this.column = column;
    this.line = line;
  }
}

export class SourceLocation {
  start: Position;
  end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }
}
