/**
 * Copied and adjusted to ES6 from
 * https://github.com/facebook/relay/blob/b652e9/scripts/babel-relay-plugin/src/tools/regenerateFixtures.js
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
 * https://github.com/facebook/relay/blob/b652e92/scripts/babel-relay-plugin/PATENTS
 */

import fs from 'fs';
import path from 'path';

export default function readFixtures(fixturePath) {
  /* eslint-disable prefer-template */
  let fileNames = fs.readdirSync(fixturePath);
  const filtered = fileNames.filter(f => f.indexOf('FOCUS_') >= 0);
  if (filtered.length > 0) {
    fileNames = filtered;
  }
  const fixtures = {};
  fileNames.forEach(filename => {
    const match = filename.match(/^\w+\.fixture$/);
    if (match === null) {
      return;
    }
    const name = match[0];
    const data = fs.readFileSync(
      path.join(fixturePath, filename),
      { encoding: 'utf8' }
    );
    let parts;

    // Matches a file of form:
    //   Input:
    //   <code>
    //   Output:
    //   <code>
    parts = data.match(new RegExp(
      '(?:^|\\n)' + [
        'Input:\\n([\\s\\S]*)',
        'Output:\\n([\\s\\S]*)',
      ].join('\\n') + '$'
    ));
    if (parts) {
      fixtures[name] = {
        input: parts[1].trim(),
        output: parts[2].trim(),
      };
      return;
    }

    // Matches a file of form:
    //   Input:
    //   <code>
    //   Error:
    //   <code>
    parts = data.match(new RegExp(
      '(?:^|\\n)' + [
        'Input:\\n([\\s\\S]*)',
        'Error:\\n([\\s\\S]*)',
      ].join('\\n') + '$'
    ));
    if (parts) {
      fixtures[name] = {
        input: parts[1].trim(),
        error: parts[2].trim(),
      };
      try {
        fixtures[name].error = JSON.parse(fixtures[name].error);
      } catch (e) {
        //
      }
      return;
    }

    throw new Error(`Invalid fixture file: ${filename}`);
  });

  return fixtures;
}
