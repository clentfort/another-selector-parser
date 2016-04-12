/* @flow */
export default function isNewLine(code: number): boolean {
  return code === 10 || code === 12 || code === 13;
}
