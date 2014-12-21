'use strict';

var matter = require('gray-matter');
var toc = require('..');

/**
 * The basic idea:
 *
 *  1. when front-matter exists, we need to avoid turning its properties into headings.
 *  2. We need to detect toc markers on the page. For now it's a simple HTML code comment
 *     to ensure the markdown is compatible with any parser.
 *
 * @param  {String} `str` Pass a string of markdown
 * @return {String} Get the same string back with a TOC inserted
 */

module.exports = function insert(str) {
  var re = /(?:<!-- toc(?:\s*stop)? -->)/g;
  var file;

  if (/^---/.test(str)) {
    file = matter(str);
    str = file.content;
  }

  var sections = split(str, re);
  var last = sections[sections.length - 1];

  if (sections.length === 3) {
    sections.splice(1, 1, '<!-- toc -->\n\n' + toc(last).content);
    sections.splice(2, 0, '<!-- tocstop -->');
  }

  if (sections.length === 2) {
    sections.splice(1, 0, '<!-- toc -->\n\n' + toc(last).content + '\n\n<!-- tocstop -->');
  }

  var res = sections.join('\n\n');
  if (file) {
    return matter.stringify(res, file.data);
  }
  return res;
};

function split(str, re) {
  return str.split(re).map(trim);
}

function trim(str) {
  return str.trim();
}
