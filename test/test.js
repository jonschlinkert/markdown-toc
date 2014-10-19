/*
 * marked-toc
 * https://github.com/jonschlinkert/marked-toc
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
var file = require('fs-utils');
var marked = require('marked');
var _ = require('lodash');
var toc  = require('..');

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

  it('should allow toc stop comment in text.', function () {
    var fixture = file.readFileSync('test/fixtures/tocstop.md');
    actual = toc.insert(fixture);
    var tokens = marked.lexer(actual);
    var htmlTokens = _.filter(tokens, function (token) { return token.type == 'html' });
    assert.propertyVal(htmlTokens[0], 'text', '<!-- toc -->\n\n');
    assert.propertyVal(htmlTokens[1], 'text', '<!-- toc stop -->\n\n');
  });

  it('should handle extra comments in text.', function() {
    var fixture = file.readFileSync('test/fixtures/extra-comment.md');
    actual = toc.insert(fixture);
    var tokens = marked.lexer(actual);
    var htmlTokens = _.filter(tokens, function (token) { return token.type == 'html' });
    assert.propertyVal(htmlTokens[0], 'text', '<!-- toc -->\n\n');
    // Contains 3 newlines since we don't strip newlines around initial toc comment
    assert.propertyVal(htmlTokens[1], 'text', '<!-- toc stop -->\n\n\n');
    assert.propertyVal(htmlTokens[2], 'text', '<!-- Extra comment -->\n\n');
  });

  it('should allow a custom slugify', function() {
    var actual = toc('# Some Article', {
      firsth1: true,
      slugify: function(text) {
        return '!' + text.toLowerCase().replace(/[^\w]/g, '-') + '!'
      }
    });
    var expected = "* [Some Article](#!some-article!)\n";
    assert.equal(actual, expected);
  });

  it('should allow whitelist of slugify characters', function() {
    var actual = toc('# Some Article: description!', {
      firsth1: true,
      slugifyOptions: {
        allowedChars: '!:'
      }
    });
    var expected = "* [Some Article: description!](#some-article:-description!)\n";
    assert.equal(actual, expected);
  });

});
