/* @flow */
export default function isNewLine(charCode: number): boolean {
  return charCode === 10 || charCode === 12 || charCode === 13;
}
