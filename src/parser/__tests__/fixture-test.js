/**
 * Copied and adjusted to ES6 from
 * https://github.com/facebook/relay/blob/c887d2f/scripts/babel-relay-plugin/src/__tests__/getBabelRelayPlugin-test.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * BSD License
 *
 * For Relay software
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * An additional grant of patent rights can be found at
 * https://github.com/facebook/relay/blob/c887d2f/scripts/babel-relay-plugin/PATENTS
 */

'use strict';

jest.disableAutomock();

import path from 'path';
import readFixtures from '../../tools/readFixtures';

import Tokenizer from '../../tokenizer';
import Parser from '../';

const FIXTURE_PATTERN = process.env.FIXTURE;
const FIXTURE_PATH = path.resolve(__dirname, '..', '__fixtures__');

const ConsoleErrorQueue = {
  print: console.error.bind(console),
  queue: [],
  clear() {
    ConsoleErrorQueue.queue = [];
  },
  enqueue(...args) {
    ConsoleErrorQueue.queue.push(args);
  },
  flush() {
    ConsoleErrorQueue.queue.forEach(args => {
      ConsoleErrorQueue.print(...args);
    });
  },
};

describe('parser', () => {
  const fixtures = readFixtures(FIXTURE_PATH);

  // Only print debug errors if test fails.
  console.error = ConsoleErrorQueue.enqueue;

  Object.keys(fixtures).forEach(testName => {
    if (FIXTURE_PATTERN && testName.indexOf(FIXTURE_PATTERN) < 0) {
      return;
    }

    const fixture = fixtures[testName];
    if (fixture.output !== undefined) {
      let expected = stringify(JSON.parse(fixture.output));

      it('parses selector for `' + testName + '`', () => {
        const actual = stringify(parse(fixture.input));
        if (actual !== expected) {
          ConsoleErrorQueue.flush();
          expect('\n' + actual + '\n').toBe('\n' + expected + '\n');
        }
        ConsoleErrorQueue.clear();
      });
    } else {
      it('throws for selector fixture: ' + testName, () => {
        let expected;
        try {
          parse(fixture.input, testName);
        } catch (e) {
          expected = e;
        }
        if (!expected || expected.message !== fixtures.error.message) {
          ConsoleErrorQueue.flush();
          expect(() => {
            if (expected) {
              throw expected;
            }
          }).toThrow(fixtures.error);
        }
        ConsoleErrorQueue.clear();
      });
    }
  });
});

function parse(input) {
  return new Parser(new Tokenizer(input)).parse();
}

function stringify(input) {
  return JSON.stringify(input);
}
