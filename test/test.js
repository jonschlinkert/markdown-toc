'use strict';

var fs = require('fs');
var should = require('should');
var toc = require('..');

describe('toc', function() {
  it('should generate a TOC from markdown headings:', function() {
    toc('# AAA\n## BBB\n### CCC').should.equal([
      '- [AAA](#aaa)',
      '  * [BBB](#bbb)',
      '    + [CCC](#ccc)'
    ].join('\n'));
  });

  it('should remove the first H1 when `firsth1` is false:', function() {
    toc('# AAA\n## BBB\n### CCC', {firsth1: false}).should.equal([
      '- [BBB](#bbb)',
      '  * [CCC](#ccc)'
    ].join('\n'));
  });

  it('should generate a Table of Contents using default settings', function() {
    toc(read('test/fixtures/basic.md')).should.equal([
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
    strip(toc(read('test/fixtures/fenced-code-blocks.md'))).should.equal([
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

  it('should allow custom bullet points at different depths', function() {
    var actual = toc(read('test/fixtures/heading-levels.md'), {
      bullets: ['*', '1.', '-']
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
      bullets: ['*', '-']
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

  it('should allow a custom slugify function to be passed:', function() {
    var actual = toc('# Some Article', {
      firsth1: true,
      slugify: function(str) {
        return '!' + str.replace(/[^\w]/g, '-') + '!';
      }
    });
    actual.should.equal('- [Some Article](#!Some-Article!)')
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

describe.skip('read', function() {
  it('should insert a markdown TOC.', function() {
    var str = read('test/fixtures/insert.md');
    strip(toc.insert(str)).should.equal(read('test/expected/insert.md'));
  });
});

function strip(str) {
  return str.replace(/^\s*|\s*$/g, '');
}

function read(fp) {
  return strip(fs.readFileSync(fp, 'utf8'));
}
