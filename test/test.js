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
    expect(strip(expected)).to.eql(strip(actual));
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
    expect(strip(expected)).to.eql(strip(actual));
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
    // expect(strip(expected)).to.eql(strip(actual));
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

  it('should allow custom bullet points at different depths', function() {
    fixture = file.readFileSync('test/fixtures/handlebars-helper.md');

    actual = toc(fixture, {
      bullet: ['* ', '1. ', '- ']
    });

    expected = [
      '* [Quickstart](#quickstart)',
      '* [Usage](#usage)',
      '* [Usage in Assemble](#usage-in-assemble)',
      '* [Options](#options)',
      '  1. [task options](#task-options)',
      '* [Related projects](#related-projects)',
      '    - [[grunt-convert](https://github.com/assemble/grunt-convert) [![NPM version](https://badge.fury.io/js/grunt-convert.png)](http://badge.fury.io/js/grunt-convert)](#grunt-converthttpsgithubcomassemblegrunt-convert-npm-versionhttpsbadgefuryiojsgrunt-convertpnghttpbadgefuryiojsgrunt-convert)',
      '    - [[grunt-firebase](https://github.com/assemble/grunt-firebase) [![NPM version](https://badge.fury.io/js/grunt-firebase.png)](http://badge.fury.io/js/grunt-firebase)](#grunt-firebasehttpsgithubcomassemblegrunt-firebase-npm-versionhttpsbadgefuryiojsgrunt-firebasepnghttpbadgefuryiojsgrunt-firebase)',
      '    - [[grunt-github-api](https://github.com/assemble/grunt-github-api) [![NPM version](https://badge.fury.io/js/grunt-github-api.png)](http://badge.fury.io/js/grunt-github-api)](#grunt-github-apihttpsgithubcomassemblegrunt-github-api-npm-versionhttpsbadgefuryiojsgrunt-github-apipnghttpbadgefuryiojsgrunt-github-api)',
      '    - [[grunt-matter](https://github.com/assemble/grunt-matter) [![NPM version](https://badge.fury.io/js/grunt-matter.png)](http://badge.fury.io/js/grunt-matter)](#grunt-matterhttpsgithubcomassemblegrunt-matter-npm-versionhttpsbadgefuryiojsgrunt-matterpnghttpbadgefuryiojsgrunt-matter)',
      '    - [[grunt-repos](https://github.com/assemble/grunt-repos) [![NPM version](https://badge.fury.io/js/grunt-repos.png)](http://badge.fury.io/js/grunt-repos)](#grunt-reposhttpsgithubcomassemblegrunt-repos-npm-versionhttpsbadgefuryiojsgrunt-repospnghttpbadgefuryiojsgrunt-repos)',
      '    - [[grunt-toc](https://github.com/assemble/grunt-toc) [![NPM version](https://badge.fury.io/js/grunt-toc.png)](http://badge.fury.io/js/grunt-toc)](#grunt-tochttpsgithubcomassemblegrunt-toc-npm-versionhttpsbadgefuryiojsgrunt-tocpnghttpbadgefuryiojsgrunt-toc)',
      '* [Author](#author)',
      '* [License](#license)'
    ].join('\n');
    expect(strip(expected)).to.eql(strip(actual));
  });

  it('should wrap around the bullet point array', function() {
    fixture = file.readFileSync('test/fixtures/handlebars-helper.md');

    actual = toc(fixture, {
      bullet: ['* ', '- ']
    });

    expected = [
      '* [Quickstart](#quickstart)',
      '* [Usage](#usage)',
      '* [Usage in Assemble](#usage-in-assemble)',
      '* [Options](#options)',
      '  - [task options](#task-options)',
      '* [Related projects](#related-projects)',
      '    * [[grunt-convert](https://github.com/assemble/grunt-convert) [![NPM version](https://badge.fury.io/js/grunt-convert.png)](http://badge.fury.io/js/grunt-convert)](#grunt-converthttpsgithubcomassemblegrunt-convert-npm-versionhttpsbadgefuryiojsgrunt-convertpnghttpbadgefuryiojsgrunt-convert)',
      '    * [[grunt-firebase](https://github.com/assemble/grunt-firebase) [![NPM version](https://badge.fury.io/js/grunt-firebase.png)](http://badge.fury.io/js/grunt-firebase)](#grunt-firebasehttpsgithubcomassemblegrunt-firebase-npm-versionhttpsbadgefuryiojsgrunt-firebasepnghttpbadgefuryiojsgrunt-firebase)',
      '    * [[grunt-github-api](https://github.com/assemble/grunt-github-api) [![NPM version](https://badge.fury.io/js/grunt-github-api.png)](http://badge.fury.io/js/grunt-github-api)](#grunt-github-apihttpsgithubcomassemblegrunt-github-api-npm-versionhttpsbadgefuryiojsgrunt-github-apipnghttpbadgefuryiojsgrunt-github-api)',
      '    * [[grunt-matter](https://github.com/assemble/grunt-matter) [![NPM version](https://badge.fury.io/js/grunt-matter.png)](http://badge.fury.io/js/grunt-matter)](#grunt-matterhttpsgithubcomassemblegrunt-matter-npm-versionhttpsbadgefuryiojsgrunt-matterpnghttpbadgefuryiojsgrunt-matter)',
      '    * [[grunt-repos](https://github.com/assemble/grunt-repos) [![NPM version](https://badge.fury.io/js/grunt-repos.png)](http://badge.fury.io/js/grunt-repos)](#grunt-reposhttpsgithubcomassemblegrunt-repos-npm-versionhttpsbadgefuryiojsgrunt-repospnghttpbadgefuryiojsgrunt-repos)',
      '    * [[grunt-toc](https://github.com/assemble/grunt-toc) [![NPM version](https://badge.fury.io/js/grunt-toc.png)](http://badge.fury.io/js/grunt-toc)](#grunt-tochttpsgithubcomassemblegrunt-toc-npm-versionhttpsbadgefuryiojsgrunt-tocpnghttpbadgefuryiojsgrunt-toc)',
      '* [Author](#author)',
      '* [License](#license)'
    ].join('\n');
    expect(strip(expected)).to.eql(strip(actual));
  });
});
