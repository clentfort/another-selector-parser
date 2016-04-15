import tokenize from '../';

export default function generate(input) {
  const tokens = [];
  for (const token of tokenize(input)) {
    tokens.push(token);
  }
  return JSON.stringify(tokens);
}
