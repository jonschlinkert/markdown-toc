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
var glob    = require('globule');

var sanitize = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

var actual, expected, readme;

exports['makeTOC'] = {
  'basic': function(test) {
    test.expect(1);

    readme = grunt.file.read('test/fixtures/README3.md');
    actual = makeTOC(readme);

    expected = [
      '* [Getting Started](#getting-started)',
      '* [Documentation](#documentation)',
      '* [Examples](#examples)',
      '* [Contributing](#contributing)',
      '* [Release History](#release-history)',
      '* [Author](#author)',
      '* [License](#license)'
    ].join('\n');


    // tests here
    test.equal(sanitize(actual), sanitize(expected), 'Should generate a markdown TOC.');
    test.done();
  },
  'ignore_code_blocks': function(test) {
    test.expect(1);

    readme = grunt.file.read('test/fixtures/README2.md');
    actual = makeTOC(readme);

    expected = [
      '* [Getting Started](#getting-started)',
      '* [Options](#options)',
      '* [Contributing](#contributing)',
      '* [One](#one)',
      '* [Two](#two)',
      '* [Author](#author)',
      '* [Related](#related)',
      '* [License](#license)'
    ].join('\n');

    // tests here
    test.equal(sanitize(actual), sanitize(expected), 'Should generate a markdown TOC, while ignoring headings in code blocks.');
    test.done();
  }
};



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
