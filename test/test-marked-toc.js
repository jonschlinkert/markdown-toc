/*
 * marked-toc
 * https://github.com/jonschlinkert/marked-toc
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';
var grunt   = require('grunt');
var makeTOC = require('../index.js');

var toc     = makeTOC(grunt.file.read('README.md'));

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var generatedTOC = [
  '* [marked-toc](#marked-toc)',
  '  * [Getting Started](#getting-started)',
  '  * [Documentation](#documentation)',
  '  * [Examples](#examples)',
  '  * [Contributing](#contributing)',
  '  * [Release History](#release-history)',
  '  * [Author](#author)',
  '  * [License](#license)'
].join('\n');

exports['makeTOC'] = {
  'generate': function(test) {
    test.expect(1);
    // tests here
    test.notStrictEqual(toc, generatedTOC, 'Should generate a markdown TOC.');
    test.done();
  },
};
