export default class AnotherSelectorParserError extends Error {
  constructor(...params) {
    super(...params);
    this.AnotherSelectorParserError = true;
  }
}
