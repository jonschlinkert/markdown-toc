'use strict';

var fs = require('fs');
var matter = require('gray-matter');
var toc = require('..');

module.exports = function format(str) {
  var re = /(?:<!-- toc(?:stop)? -->)/g;

  var file = matter(str);
  var lines = split(file.content, re);

  if (lines.length === 3) {
    lines.splice(2, 0, '<!-- tocstop -->');
    lines.splice(1, 0, '<!-- toc -->');
  }

  if (lines.length === 2) {
    lines.splice(1, 0, '<!-- toc -->');
  }

  var res = lines.join('\n\n');
  return matter.stringify(res, file.data);
}

function read(fp) {
  return fs.readFileSync(fp, 'utf8');
}

function split(str, re) {
  return str.split(re).map(trim);
}

function trim(str) {
  return str.trim();
}

var str = read('test/expected/insert.md');
var res = format(str);
console.log(res)
