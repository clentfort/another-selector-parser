/* @flow */
export default function isHexDigit(charCode: number): boolean {
  switch (charCode) {
    case 48: case 49: case 50: case 51: case 52: // 0 - 4
    case 53: case 54: case 55: case 56: case 57: // 5 - 9
    case 65: case 66: case 67: case 68: case 69: case 70: // A - F
    case 97: case 98: case 99: case 100: case 101: case 102: // a - f
      return true;
    default:
      return false;
  }
}
