'use strict';

require('mocha');
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

    assert.equal(actual.content, [
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

    assert.equal(actual.content, [
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
    assert.equal(actual.content, '- [Some Article](#!Some-Article!)');
  });

  it('should strip forward slashes in slugs', function() {
    var actual = toc('# Some/Article');
    assert.equal(actual.content, '- [Some/Article](#somearticle)');
  });

  it('should strip backticks in slugs', function() {
    var actual = toc('# Some`Article`');
    assert.equal(actual.content, '- [Some`Article`](#somearticle)');
  });

  it('should strip CJK punctuations in slugs', function() {
    var actual = toc('# 存在，【中文】；《标点》、符号！的标题？');
    assert.equal(actual.content, '- [存在，【中文】；《标点》、符号！的标题？](#%E5%AD%98%E5%9C%A8%E4%B8%AD%E6%96%87%E6%A0%87%E7%82%B9%E7%AC%A6%E5%8F%B7%E7%9A%84%E6%A0%87%E9%A2%98)');
  });

  it('should strip & in slugs', function() {
    var actual = toc('# Foo & Bar');
    assert.equal(actual.content, '- [Foo & Bar](#foo--bar)');
  });

  it('should escape the CJK characters in linkify', function() {
    assert.equal(toc('# 中文').content, '- [中文](#%E4%B8%AD%E6%96%87)');
    assert.equal(toc('# かんじ').content, '- [かんじ](#%E3%81%8B%E3%82%93%E3%81%98)');
    assert.equal(toc('# 한자').content, '- [한자](#%ED%95%9C%EC%9E%90)');
  });

  it('should strip HTML tags from headings', function() {
    assert.equal(toc('# <test>Foo').content, '- [Foo](#foo)');
    assert.equal(toc('# <test> Foo').content, '- [Foo](#-foo)');
    assert.equal(toc('# <test> Foo ').content, '- [Foo](#-foo)');
    assert.equal(toc('# <div> Foo </div>').content, '- [Foo](#-foo-)');
    assert.equal(toc('#  Foo <test>').content, '- [Foo](#foo-)');
  });

  it('should not strip HTML tags from headings when `stripHeadingTags` is false', function() {
    var opts = {stripHeadingTags: false};
    assert.equal(toc('# <test>Foo', opts).content, '- [Foo](#testfoo)');
    assert.equal(toc('# <test> Foo', opts).content, '- [Foo](#test-foo)');
    assert.equal(toc('# <test> Foo ', opts).content, '- [Foo](#test-foo)');
    assert.equal(toc('# <div> Foo </div>', opts).content, '- [Foo](#div-foo-div)');
    assert.equal(toc('#  Foo <test>', opts).content, '- [Foo](#foo-test)');
  });

  it('should condense spaces in the heading text', function() {
    var actual = toc('# Some    Article');
    assert.equal(actual.content, '- [Some Article](#some----article)');
  });

  it('should replace spaces in links with dashes', function() {
    assert.equal(toc('# Foo - bar').content, '- [Foo - bar](#foo---bar)');
    assert.equal(toc('# Foo- - -bar').content, '- [Foo- - -bar](#foo-----bar)');
    assert.equal(toc('# Foo---bar').content, '- [Foo---bar](#foo---bar)');
    assert.equal(toc('# Foo- - -bar').content, '- [Foo- - -bar](#foo-----bar)');
    assert.equal(toc('# Foo- -   -bar').content, '- [Foo- - -bar](#foo-------bar)');
  });

  it('should allow a `filter` function to filter out unwanted bullets:', function() {
    var actual = toc(read('test/fixtures/filter.md'), {
      filter: function(str, ele, arr) {
        return str.indexOf('...') === -1;
      }
    });
    assert.equal(actual.content, [
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
    assert.equal(toc('# AAA\n# BBB\n# CCC\nfoo\nbar\nbaz').content, [
      '- [AAA](#aaa)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)'
    ].join('\n'));
  });

  it('should allow duplicate headings:', function() {
    assert.equal(toc('# AAA\n# BBB\n# BBB\n# CCC\nfoo\nbar\nbaz').content, [
      '- [AAA](#aaa)',
      '- [BBB](#bbb)',
      '- [BBB](#bbb-1)',
      '- [CCC](#ccc)'
    ].join('\n'));
  });

  it('should increment duplicate headings:', function() {
    assert.equal(toc('### AAA\n### AAA\n### AAA').json[0].slug, 'aaa');
    assert.equal(toc('### AAA\n### AAA\n### AAA').json[1].slug, 'aaa-1');
    assert.equal(toc('### AAA\n### AAA\n### AAA').json[2].slug, 'aaa-2');
  });

  it('should allow and ignore empty headings:', function() {
    assert.equal(toc('#\n# \n# AAA\n# BBB\nfoo\nbar\nbaz#\n').content, [
      '- [AAA](#aaa)',
      '- [BBB](#bbb)'
    ].join('\n'));
  });

  it('should handle dots, colons dashes and underscores correctly:', function() {
    assert.equal(toc('# AAA:aaa\n# BBB.bbb\n# CCC-ccc\n# DDD_ddd\nfoo\nbar\nbaz').content, [
      '- [AAA:aaa](#aaaaaa)',
      '- [BBB.bbb](#bbbbbb)',
      '- [CCC-ccc](#ccc-ccc)',
      '- [DDD_ddd](#ddd_ddd)'
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    assert.equal(toc(read('test/fixtures/levels.md')).content, [
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    assert.equal(toc(read('test/fixtures/repeat-bullets.md')).content, [
      '- [AAA](#aaa)',
      '  * [a.1](#a1)',
      '    + [a.2](#a2)',
      '      - [a.3](#a3)',
      '        * [a.4](#a4)'
    ].join('\n'));
  });

  it('should handle mixed heading levels:', function() {
    assert.equal(toc(read('test/fixtures/mixed.md')).content, [
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
    assert.equal(toc(read('test/fixtures/fenced-code-blocks.md')).content, [
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
    assert.equal(toc('# AAA\n## BBB\n### CCC', {maxdepth: 2}).content, [
      '- [AAA](#aaa)',
      '  * [BBB](#bbb)'
    ].join('\n'));
  });

  it('should remove the first H1 when `firsth1` is false:', function() {
    assert.equal(toc('# AAA\n## BBB\n### CCC', {firsth1: false}).content, [
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));
  });

  it.skip('should correctly calculate `maxdepth` when `firsth1` is false:', function() {
    assert.equal(toc('# AAA\n## BBB\n### CCC\n#### DDD', {maxdepth: 2, firsth1: false}).content, [
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));

    assert.equal(toc('## BBB\n### CCC\n#### DDD', {maxdepth: 2, firsth1: false}).content, [
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));
  });

  it('should allow custom bullet points to be defined:', function() {
    var actual = toc('# AAA\n# BBB\n# CCC', {
      bullets: ['?']
    });

    assert.equal(actual.content, [
      '? [AAA](#aaa)',
      '? [BBB](#bbb)',
      '? [CCC](#ccc)'
    ].join('\n'));
  });

  it('should rotate bullets when there are more levels than bullets defined:', function() {
    var actual = toc('# AAA\n## BBB\n### CCC', {
      bullets: ['?']
    });

    assert.equal(actual.content, [
      '? [AAA](#aaa)',
      '  ? [BBB](#bbb)',
      '    ? [CCC](#ccc)'
    ].join('\n'));
  });

  it('should rotate bullets when there are more levels than bullets defined:', function() {
    var actual = toc(read('test/fixtures/repeated-headings.md')).content;
    assert.equal(actual, read('test/expected/repeated-headings.md'));
  });

  it('should wrap around the bullet point array', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullets: ['*', '-']
    });

    assert.equal(actual.content, [
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

    assert.equal(actual.content, [
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

  it('should remove diacritics from the links', function() {
    var actual = toc(read('test/fixtures/diacritics.md'));

    assert.equal(actual.content, [
      '- [Regras de formatação de código](#regras-de-formatacao-de-codigo)',
      '- [Conteúdo de autenticação côncovo](#conteudo-de-autenticacao-concovo)'
    ].join('\n'));
  });

  it('should strip words from heading text, but not from urls:', function() {
    var actual = toc(read('test/fixtures/strip-words.md'), {
      strip: ['foo', 'bar', 'baz', 'fez']
    });

    assert.equal(actual.content, [
      '- [aaa](#foo-aaa)',
      '- [bbb](#bar-bbb)',
      '- [ccc](#baz-ccc)',
      '- [ddd](#fez-ddd)'
    ].join('\n'));
  });
});

describe('toc tokens', function() {
  it('should return an object for customizing a toc:', function() {
    var actual = toc('# AAA\n## BBB\n### CCC');
    assert(actual);
    assert.equal(typeof actual, 'object');
    assert(actual.hasOwnProperty('content'));
    assert(actual.hasOwnProperty('highest'));
    assert(actual.hasOwnProperty('tokens'));
  });

  it('should return the `highest` heading level in the TOC:', function() {
    assert.equal(toc('# AAA\n## BBB\n### CCC\n#### DDD').highest, 1);
    assert.equal(toc('## BBB\n### CCC\n#### DDD').highest, 2);
    assert.equal(toc('### CCC\n#### DDD').highest, 3);
  });

  it('should return an array of tokens:', function() {
    assert(Array.isArray(toc('# AAA\n## BBB\n### CCC').tokens));
  });

  it('should expose the `lvl` property on headings tokens:', function() {
    var actual = toc('# AAA\n## BBB\n### CCC');
    assert.equal(actual.tokens[1].lvl, 1);
    assert.equal(actual.tokens[4].lvl, 2);
    assert.equal(actual.tokens[7].lvl, 3);
  });
});

describe('json property', function() {
  it('should expose a `json` property:', function() {
    var actual = toc('# AAA\n## BBB\n## BBB\n### CCC\nfoo');
    assert(Array.isArray(actual.json));
    assert(actual.json[0].hasOwnProperty('content'));
    assert(actual.json[0].hasOwnProperty('lvl'));
    assert(actual.json[0].hasOwnProperty('slug'));
  });

  it('should return the `content` property for a heading:', function() {
    assert.equal(toc('# AAA\n## BBB\n### CCC\n#### DDD').json[0].content, 'AAA');
    assert.equal(toc('## BBB\n### CCC\n#### DDD').json[2].content, 'DDD');
    assert.equal(toc('### CCC\n#### DDD').json[0].content, 'CCC');
  });
});

describe('toc.insert', function() {
  it('should retain trailing newlines in the given string', function() {
    var str = fs.readFileSync('test/fixtures/newline.md', 'utf8');
    assert.equal(toc.insert(str), fs.readFileSync('test/expected/newline.md', 'utf8'));
  });

  it('should insert a markdown TOC beneath a `<!-- toc -->` comment.', function() {
    var str = read('test/fixtures/insert.md');
    assert.equal(strip(toc.insert(str)), read('test/expected/insert.md'));
  });

  it('should replace an old TOC between `<!-- toc -->...<!-- tocstop -->` comments.', function() {
    var str = read('test/fixtures/replace-existing.md');
    assert.equal(strip(toc.insert(str)), read('test/expected/replace-existing.md'));
  });

  it('should insert the toc passed on the options.', function() {
    var str = read('test/fixtures/replace-existing.md');
    assert.equal(strip(toc.insert(str, {toc: toc(str).content})), read('test/expected/replace-existing.md'));
    assert.equal(strip(toc.insert(str, {toc: '- Foo'})), read('test/expected/foo.md'));
  });

  it('should accept options', function() {
    var str = read('test/fixtures/insert.md');
    var actual = toc.insert(str, { slugify: function(text) {
      return text.toLowerCase();
    }});

    assert.equal(strip(actual), read('test/expected/insert-options.md'));
  });

  it('should accept no links option', function() {
    var str = read('test/fixtures/insert.md');
    assert.equal(strip(toc.insert(str, { })), read('test/expected/insert.md'));
    assert.equal(strip(toc.insert(str, { linkify: true })), read('test/expected/insert.md'));
    assert.equal(strip(toc.insert(str, { linkify: false })), read('test/expected/insert-no-links.md'));
  });

  it('should not mangle a file with an initial horizontal rule', function() {
    assert.equal(toc.insert('---\nExample\n'),  '---\nExample\n');
  })

  it('should not generate a link to a commented heading', function() {
    assert.equal(toc.insert(read('test/fixtures/commented-header.md')), read('test/expected/commented-header.md'));
  })


  it('should not strip inline code', function() {
    assert.equal(toc.insert(read('test/fixtures/inline-code.md')), read('test/expected/inline-code.md'))
  })

  it('should strip symbols instead of making them dashes in slug', function() {
    assert.equal(toc.insert(read('test/fixtures/symbols-in-heading.md')), read('test/expected/symbols-in-heading.md'))
  })

});
