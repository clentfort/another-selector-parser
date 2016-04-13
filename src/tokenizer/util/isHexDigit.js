/* @flow */
import isDigit from './isDigit';

export default function isHexDigit(charCode: number): boolean {
  return (
    isDigit(charCode) ||
    (charCode >= 65 && charCode <= 70) /* A - F */ ||
    (charCode >= 97 && charCode <= 102) /* a - f */
  );
}
