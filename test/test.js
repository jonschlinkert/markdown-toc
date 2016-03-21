'use strict';

require('mocha');
require('should');
var fs = require('fs');
var assert = require('assert');
var inspect = require('util').inspect;
var utils = require('../lib/utils');
var toc = require('..');

function strip(str) {
  return str.trim();
}

function read(fp) {
  return strip(fs.readFileSync(fp, 'utf8'));
}

describe('plugin', function() {
  it('should work as a remarkable plugin', function() {
    function render(str, options) {
      return new utils.Remarkable()
        .use(toc.plugin(options))
        .render(str);
    }

    var actual = render(read('test/fixtures/strip-words.md'), {
      slugify: false,
      strip: function(str) {
        return '~' + str.slice(4) + '~';
      }
    });

    actual.content.should.equal([
      '- [~aaa~](#foo-aaa)',
      '- [~bbb~](#bar-bbb)',
      '- [~ccc~](#baz-ccc)',
      '- [~ddd~](#fez-ddd)'
    ].join('\n'));
  });
});

describe('options: custom functions:', function() {
  it('should allow a custom `strip` function to strip words from heading text:', function() {
    var actual = toc(read('test/fixtures/strip-words.md'), {
      slugify: false,
      strip: function(str) {
        return '~' + str.slice(4) + '~';
      }
    });

    actual.content.should.equal([
      '- [~aaa~](#foo-aaa)',
      '- [~bbb~](#bar-bbb)',
      '- [~ccc~](#baz-ccc)',
      '- [~ddd~](#fez-ddd)'
    ].join('\n'));
  });

  it('should allow a custom slugify function to be passed:', function() {
    var actual = toc('# Some Article', {
      firsth1: true,
      slugify: function(str) {
        return '!' + str.replace(/[^\w]/g, '-') + '!';
      }
    });
    actual.content.should.equal('- [Some Article](#!Some-Article!)');
  });

  it('should allow a custom slugending function for duplicate hendings to be passed:', function() {
    var actual = toc('# Overview\n# Overview', {
      slugending: function(str, seen, opts) {
       return str + '-' + (seen + 1);  // starts at '-2' for first duplicate slug rather than '-1'
      }
    });
    actual.content.should.equal([
      '- [Overview](#overview)',
      '- [Overview](#overview-2)'
    ].join('\n'));
  });

  it('should strip forward slashes in slugs', function() {
    var actual = toc('# Some/Article');
    actual.content.should.equal('- [Some/Article](#somearticle)');
  });

  it('should strip backticks in slugs', function() {
    var actual = toc('# Some`Article`');
    actual.content.should.equal('- [Some`Article`](#somearticle)');
  });

  it('should strip & in slugs', function() {
    var actual = toc('# Foo & Bar');
    actual.content.should.equal('- [Foo & Bar](#foo--bar)');
  });

  it('should condense spaces in the heading text', function() {
    var actual = toc('# Some    Article');
    actual.content.should.equal('- [Some Article](#some----article)');
  });

  it('should replace spaces with tabs', function() {
    assert((toc('# Foo - bar').content) === '- [Foo - bar](#foo---bar)');
    assert((toc('# Foo- - -bar').content) === '- [Foo- - -bar](#foo-----bar)');
    assert((toc('# Foo---bar').content) === '- [Foo---bar](#foo---bar)');
    assert((toc('# Foo- - -bar').content) === '- [Foo- - -bar](#foo-----bar)');
    assert((toc('# Foo- -   -bar').content) === '- [Foo- -   -bar](#foo-------bar)');
  });

  it('should allow a `filter` function to filter out unwanted bullets:', function() {
    var actual = toc(read('test/fixtures/filter.md'), {
      filter: function(str, ele, arr) {
        return str.indexOf('...') === -1;
      }
    });
    actual.content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)',
      '- [CCC](#ccc-1)',
      '    + [bbb](#bbb)',
      '- [DDD](#ddd)',
      '- [EEE](#eee)',
      '  * [FFF](#fff)',
    ].join('\n'));
  });
});

describe('toc', function() {
  it('should generate a TOC from markdown headings:', function() {
    toc('# AAA\n# BBB\n# CCC\nfoo\nbar\nbaz').content.should.equal([
      '- [AAA](#aaa)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)'
    ].join('\n'));
  });

  it('should allow duplicate headings:', function() {
    toc('# AAA\n# BBB\n# BBB\n# CCC\nfoo\nbar\nbaz').content.should.equal([
      '- [AAA](#aaa)',
      '- [BBB](#bbb)',
      '- [BBB](#bbb-1)',
      '- [CCC](#ccc)'
    ].join('\n'));
  });

  it('should handle dots, colons dashes and underscores correctly:', function() {
    toc('# AAA:aaa\n# BBB.bbb\n# CCC-ccc\n# DDD_ddd\nfoo\nbar\nbaz').content.should.equal([
      '- [AAA:aaa](#aaaaaa)',
      '- [BBB.bbb](#bbbbbb)',
      '- [CCC-ccc](#ccc-ccc)',
      '- [DDD_ddd](#ddd_ddd)'
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    toc(read('test/fixtures/levels.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    toc(read('test/fixtures/repeat-bullets.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
      '        * [a.4](#a4)'
    ].join('\n'));
  });

  it('should handle mixed heading levels:', function() {
    toc(read('test/fixtures/mixed.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)',
      '- [DDD](#ddd)',
      '- [EEE](#eee)',
      '  * [FFF](#fff)'
    ].join('\n'));
  });

  it('should ignore headings in fenced code blocks.', function() {
    toc(read('test/fixtures/fenced-code-blocks.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)',
      '- [DDD](#ddd)',
      '- [EEE](#eee)',
      '  * [FFF](#fff)'
    ].join('\n'));
  });

  it('should allow `maxdepth` to limit heading levels:', function() {
    toc('# AAA\n## BBB\n### CCC', {maxdepth: 2}).content.should.equal([
      '- [AAA](#aaa)',
      '  * [BBB](#bbb)'
    ].join('\n'));
  });

  it('should remove the first H1 when `firsth1` is false:', function() {
    toc('# AAA\n## BBB\n### CCC', {firsth1: false}).content.should.equal([
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));
  });

  it.skip('should correctly calculate `maxdepth` when `firsth1` is false:', function() {
    toc('# AAA\n## BBB\n### CCC\n#### DDD', {maxdepth: 2, firsth1: false}).content.should.equal([
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));

    toc('## BBB\n### CCC\n#### DDD', {maxdepth: 2, firsth1: false}).content.should.equal([
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));
  });

  it('should allow custom bullet points to be defined:', function() {
    var actual = toc('# AAA\n# BBB\n# CCC', {
      bullets: ['?']
    });

    actual.content.should.equal([
      '? [AAA](#aaa)',
      '? [BBB](#bbb)',
      '? [CCC](#ccc)'
    ].join('\n'));
  });

  it('should rotate bullets when there are more levels than bullets defined:', function() {
    var actual = toc('# AAA\n## BBB\n### CCC', {
      bullets: ['?']
    });

    actual.content.should.equal([
      '? [AAA](#aaa)',
      '  ? [BBB](#bbb)',
      '    ? [CCC](#ccc)'
    ].join('\n'));
  });

  it('should rotate bullets when there are more levels than bullets defined:', function() {
    var actual = toc(read('test/fixtures/repeated-headings.md')).content;
    actual.should.equal(read('test/expected/repeated-headings.md'));
  });

  it('should wrap around the bullet point array', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullets: ['*', '-']
    });

    actual.content.should.equal([
      '* [AAA](#aaa)',
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)',
      '* [BBB](#bbb)',
      '  - [aaa](#aaa-1)',
      '    * [bbb](#bbb-1)',
      '* [CCC](#ccc)',
      '  - [aaa](#aaa-2)',
      '    * [bbb](#bbb-2)'
    ].join('\n'));
  });

  it('should allow custom bullet points at different depths', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullets: ['*', '1.', '-']
    });

    actual.content.should.equal([
      '* [AAA](#aaa)',
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)',
      '* [BBB](#bbb)',
      '  1. [aaa](#aaa-1)',
      '    - [bbb](#bbb-1)',
      '* [CCC](#ccc)',
      '  1. [aaa](#aaa-2)',
      '    - [bbb](#bbb-2)'
    ].join('\n'));
  });

  it('should strip words from heading text, but not from urls:', function() {
    var actual = toc(read('test/fixtures/strip-words.md'), {
      strip: ['foo', 'bar', 'baz', 'fez']
    });

    actual.content.should.equal([
      '- [aaa](#foo-aaa)',
      '- [bbb](#bar-bbb)',
      '- [ccc](#baz-ccc)',
      '- [ddd](#fez-ddd)'
    ].join('\n'));
  });
});

describe('toc tokens', function() {
  var result = toc('# AAA\n## BBB\n### CCC');

  it('should return an object for customizing a toc:', function() {
    result.should.be.an.object;
    result.should.have.properties(['highest', 'tokens', 'content']);
  });

  it('should return the `highest` heading level in the TOC:', function() {
    toc('# AAA\n## BBB\n### CCC\n#### DDD').should.have.property('highest', 1);
    toc('## BBB\n### CCC\n#### DDD').should.have.property('highest', 2);
    toc('### CCC\n#### DDD').should.have.property('highest', 3);
  });

  it('should return an array of tokens:', function() {
    result.tokens.should.be.an.array;
  });

  it('should expose the `lvl` property on headings tokens:', function() {
    result.tokens[1].should.have.property('lvl', 1);
    result.tokens[4].should.have.property('lvl', 2);
    result.tokens[7].should.have.property('lvl', 3);
  });
});

describe('json property', function() {
  var result = toc('# AAA\n## BBB\n## BBB\n### CCC\nfoo');
  it('should expose a `json` property:', function() {
    result.json.should.be.an.array;
    result.json[0].should.have.properties(['content', 'lvl', 'slug']);
  });

  it('should return the `content` property for a heading:', function() {
    toc('# AAA\n## BBB\n### CCC\n#### DDD').json[0].should.have.property('content', 'AAA');
    toc('## BBB\n### CCC\n#### DDD').json[2].should.have.property('content', 'DDD');
    toc('### CCC\n#### DDD').json[0].should.have.property('content', 'CCC');
  });
});

describe('toc.insert', function() {
  it('should retain trailing newlines in the given string', function() {
    var str = fs.readFileSync('test/fixtures/newline.md', 'utf8');
    toc.insert(str).should.equal(fs.readFileSync('test/expected/newline.md', 'utf8'));
  });

  it('should insert a markdown TOC beneath a `<!-- toc -->` comment.', function() {
    var str = read('test/fixtures/insert.md');
    strip(toc.insert(str)).should.equal(read('test/expected/insert.md'));
  });

  it('should replace an old TOC between `<!-- toc -->...<!-- tocstop -->` comments.', function() {
    var str = read('test/fixtures/replace-existing.md');
    strip(toc.insert(str)).should.equal(read('test/expected/replace-existing.md'));
  });

  it('should insert the toc passed on the options.', function() {
    var str = read('test/fixtures/replace-existing.md');
    strip(toc.insert(str, {toc: toc(str).content})).should.equal(read('test/expected/replace-existing.md'));
    strip(toc.insert(str, {toc: '- Foo'})).should.equal(read('test/expected/foo.md'));
  });

  it('should accept options', function() {
    var str = read('test/fixtures/insert.md');
    strip(toc.insert(str, { slugify: function(text) {
      return text.toLowerCase();
    }})).should.equal(read('test/expected/insert-options.md'));
  });
});
