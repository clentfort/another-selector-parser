/* @flow */
import isNewLine from './isNewLine';
export default function isWhitespace(charCode: number): boolean {
  return (
    charCode === 9 ||  /* "\t" */
    charCode === 32 || /* " " */
    isNewLine(charCode)
  );
}
