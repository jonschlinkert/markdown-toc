'use strict';

var fs = require('fs');
var inspect = require('util').inspect;
var should = require('should');
var toc = require('..');

describe('toc', function() {
  it('should generate a TOC from markdown headings:', function() {
    toc('# AAA\n# BBB\n# CCC\nfoo\nbar\nbaz').content.should.equal([
      '- [AAA](#aaa)',
      '- [BBB](#bbb)',
      '- [CCC](#ccc)'
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    toc(read('test/fixtures/levels.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a-1)',
      '    + [a.2](#a-2)',
      '      ~ [a.3](#a-3)',
    ].join('\n'));
  });

  it('should use a different bullet for each level', function() {
    toc(read('test/fixtures/repeat-bullets.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a-1)',
      '    + [a.2](#a-2)',
      '      ~ [a.3](#a-3)',
      '        - [a.4](#a-4)'
    ].join('\n'));
  });

  it('should handle mixed heading levels:', function() {
    toc(read('test/fixtures/mixed.md')).content.should.equal([
      '- [AAA](#aaa)',
      '  * [a.1](#a-1)',
      '    + [a.2](#a-2)',
      '      ~ [a.3](#a-3)',
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
      '  * [a.1](#a-1)',
      '    + [a.2](#a-2)',
      '      ~ [a.3](#a-3)',
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

  it('should use custom bullets at any depth:', function() {
    var actual = toc('# AAA\n## BBB\n### CCC', {
      bullets: ['?']
    });

    actual.content.should.equal([
      '? [AAA](#aaa)',
      '  ? [BBB](#bbb)',
      '    ? [CCC](#ccc)'
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
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)',
      '* [CCC](#ccc)',
      '  1. [aaa](#aaa)',
      '    - [bbb](#bbb)'
    ].join('\n'));
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
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)',
      '* [CCC](#ccc)',
      '  - [aaa](#aaa)',
      '    * [bbb](#bbb)'
    ].join('\n'));
  });

  it('should strip words from heading text, but not urls:', function() {
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

  it.skip('should allow a custom function to be passed for stripping words from heading text:', function() {
    var actual = toc(read('test/fixtures/strip-words.md'), {
      strip: function(str) {
        var re = new RegExp(['foo', 'bar', 'baz', 'fez', '-'].join('|'), 'g');
        return str.replace(re, '~');
      }
    });

    actual.content.should.equal([
      '- [~aaa](#foo-aaa)',
      '- [~bbb](#bar-bbb)',
      '- [~ccc](#baz-ccc)',
      '- [~ddd](#fez-ddd)'
    ].join('\n'));
  });

  it('should allow a custom slugify function to be passed:', function() {
    var actual = toc('# Some Article', {
      firsth1: true,
      slugify: function(str) {
        return '!' + str.replace(/[^\w]/g, '-') + '!';
      }
    });
    actual.content.should.equal('- [Some Article](#!Some-Article!)')
  });

  // it('should allow tocstop comment in text.', function() {
  //   var tokens = marked.lexer(toc.insert(read('test/fixtures/tocstop.md')));
  //   var htmlTokens = _.filter(tokens, function(token) {
  //     return token.type == 'html'
  //   });

  //   htmlTokens[0].should.eql({ type: 'html', pre: false, text: '<!-- toc -->\n\n' });
  //   htmlTokens[1].should.eql({ type: 'html', pre: false, text: '<!-- tocstop -->\n\n' });
  // });

  // it('should handle extra comments in text.', function() {
  //   var actual = toc.insert(read('test/fixtures/extra-comment.md'));
  //   var tokens = marked.lexer(actual);
  //   var htmlTokens = _.filter(tokens, function(token) {
  //     return token.type == 'html'
  //   });

  //   htmlTokens[0].should.eql({ type: 'html', pre: false, text: '<!-- toc -->\n\n' });
  //   htmlTokens[1].should.eql({ type: 'html', pre: false, text: '<!-- tocstop -->\n\n\n' });
  //   htmlTokens[2].should.eql({ type: 'html', pre: false, text: '<!-- Extra comment -->\n\n' });
  // });
});

// this is lame, but for now I just want to get this working
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

describe.skip('read', function() {
  it('should insert a markdown TOC.', function() {
    var str = read('test/fixtures/insert.md');
    toc.insert(str).content.should.equal(read('test/expected/insert.md'));
  });
});

function strip(str) {
  return str.replace(/^\s*|\s*$/g, '');
}

function read(fp) {
  return strip(fs.readFileSync(fp, 'utf8'));
}
