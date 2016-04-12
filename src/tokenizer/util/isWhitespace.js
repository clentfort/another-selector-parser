/* @flow */
export default function isWhitespace(charCode: number): boolean {
  return (
    charCode === 9 || // "\t" (Tab)
    charCode === 10 || // "\n" (Line Break)
    charCode === 12 || // "\f" (Form feed)
    charCode === 13 || // "\r" (Carriage return)
    charCode === 32 // " " (Space)
  );
}
