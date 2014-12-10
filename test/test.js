/*
 * marked-toc
 * https://github.com/jonschlinkert/marked-toc
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var should = require('should');
var marked = require('marked');
var _ = require('lodash');
var toc = require('..');

describe('toc', function() {
  it('should generate a Table of Contents using default settings', function() {
    strip(toc(read('test/fixtures/README3.md'))).should.equal([
      '* [Getting Started](#getting-started)',
      '* [Documentation](#documentation)',
      '* [Examples](#examples)',
      '* [Contributing](#contributing)',
      '* [Release History](#release-history)',
      '* [Author](#author)',
      '* [License](#license)'
    ].join('\n'));
  });

  it('should generate a markdown TOC, while ignoring headings inside fenced code blocks.', function() {
    strip(toc(read('test/fixtures/README2.md'))).should.equal([
      '* [Getting Started](#getting-started)',
      '* [Options](#options)',
      '* [Contributing](#contributing)',
      '* [One](#one)',
      '* [Two](#two)',
      '* [Author](#author)',
      '* [Related](#related)',
      '* [License](#license)'
    ].join('\n'));
  });

  it('should insert a markdown TOC.', function() {
    var str = read('test/fixtures/insert.md');
    strip(toc.insert(str)).should.equal(read('test/expected/insert.md'));
  });

  it('should allow tocstop comment in text.', function() {
    var tokens = marked.lexer(toc.insert(read('test/fixtures/tocstop.md')));
    var htmlTokens = _.filter(tokens, function(token) {
      return token.type == 'html'
    });

    htmlTokens[0].should.eql({ type: 'html', pre: false, text: '<!-- toc -->\n\n' });
    htmlTokens[1].should.eql({ type: 'html', pre: false, text: '<!-- tocstop -->\n\n' });
  });

  it('should handle extra comments in text.', function() {
    var actual = toc.insert(read('test/fixtures/extra-comment.md'));
    var tokens = marked.lexer(actual);
    var htmlTokens = _.filter(tokens, function(token) {
      return token.type == 'html'
    });

    htmlTokens[0].should.eql({ type: 'html', pre: false, text: '<!-- toc -->\n\n' });
    htmlTokens[1].should.eql({ type: 'html', pre: false, text: '<!-- tocstop -->\n\n\n' });
    htmlTokens[2].should.eql({ type: 'html', pre: false, text: '<!-- Extra comment -->\n\n' });
  });

  it('should allow a custom slugify function to be passed:', function() {
    var actual = toc('# Some Article', {
      firsth1: true,
      slugify: function(str) {
        return '!' + str.replace(/[^\w]/g, '-') + '!';
      }
    });
    actual.should.equal('* [Some Article](#!Some-Article!)\n')
  });

  it('should allow whitelist of slugify characters', function() {
    var actual = toc('# Some Article: description!', {
      firsth1: true,
      slugifyOptions: {allowedChars: '!:'}
    });
    actual.should.equal('* [Some Article: description!](#some-article:-description!)\n')
  });

  it('should allow custom bullet points at different depths', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullet: ['* ', '1. ', '- ']
    });

    strip(actual).should.equal([
      '* [AAA](#aaa)',
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)',
      '* [BBB](#bbb)',
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)',
      '* [CCC](#ccc)',
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)'
    ].join('\n'));
  });

  it('should wrap around the bullet point array', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullet: ['* ', '- ']
    });

    strip(actual).should.equal([
      '* [AAA](#aaa)',
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)',
      '* [BBB](#bbb)',
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)',
      '* [CCC](#ccc)',
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)'
    ].join('\n'));
  });
});

function strip(str) {
  return str.replace(/^\s*|\s*$/g, '');
}

function read(fp) {
  return strip(fs.readFileSync(fp, 'utf8'));
}
