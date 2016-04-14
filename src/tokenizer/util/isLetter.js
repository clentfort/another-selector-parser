/* @flow */

export default function isLetter(charCode: number): boolean {
  return (
    (charCode >= 65 && charCode <= 90) /* A - Z */ ||
    (charCode >= 97 && charCode <= 122) /* a - z */
  );
}
