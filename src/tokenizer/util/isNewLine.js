/* @flow */
export const lineBreak = /\r\n?|\n/g;
export default function isNewLine(charCode: number): boolean {
  return charCode === 10 || charCode === 12 || charCode === 13;
}
