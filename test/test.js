/*
 * marked-toc
 * https://github.com/jonschlinkert/marked-toc
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

var expect = require('chai').expect;
var file = require('fs-utils');
var toc  = require('../index');

var strip = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

var actual, expected, fixture;

describe('toc', function () {
  it('should generate a Table of Contents using default settings', function () {
    fixture = file.readFileSync('test/fixtures/README3.md');
    actual = toc(fixture);
    expected = [
      '* [Getting Started](#getting-started)',
      '* [Documentation](#documentation)',
      '* [Examples](#examples)',
      '* [Contributing](#contributing)',
      '* [Release History](#release-history)',
      '* [Author](#author)',
      '* [License](#license)'
    ].join('\n');
    expect(strip(actual)).to.eql(strip(expected));
  });

  it('should generate a markdown TOC, while ignoring headings inside fenced code blocks.', function () {
    fixture = file.readFileSync('test/fixtures/README2.md');
    actual = toc(fixture);
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
    expect(strip(actual)).to.eql(strip(expected));
  });

  it('should insert a markdown TOC.', function () {
    var fixture = 'test/fixtures/marker.md';
    actual = toc.insert(fixture, {dest: 'test/actual/marker.md'});
    // expected = [
    //   '* [Getting Started](#getting-started)',
    //   '* [Options](#options)',
    //   '* [Contributing](#contributing)',
    //   '* [One](#one)',
    //   '* [Two](#two)',
    //   '* [Author](#author)',
    //   '* [Related](#related)',
    //   '* [License](#license)'
    // ].join('\n');
    // expect(strip(actual)).to.eql(strip(expected));
  });
});