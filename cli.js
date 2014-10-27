#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var util = require('util');
var toc = require('./');
var lineparser = require('lineparser');

var meta = {
  program: 'toc',
  name: 'Marked Toc',
  subcommands: ['help', 'add'],
  options: {
    parameters: [
      ['b', 'bullet', 'Bullet character', '*'],
      ['d', 'maxDepth', 'Use headings whose depth is at most maxDepth.', 3],
    ],
    flags: [
      ['f', 'firsth1', 'Include first h1', true],
    ]
  },
  usages: [
    ['help', null, null, 'Show this help', function(r) {
      console.log(r.help())
    }],
    ['add', ['[d]', '[b]', '[firsth1]'],
      ['src', 'dest'], 'Add toc with options', convert
    ],
    [null, null, ['src', 'dest'], 'Simple add. omit dest will writeback to' +
      ' src, omit src will convert "README.md"', convert
    ],
  ]
}

try {
  var parser = lineparser.init(meta);
  parser.parse(process.argv.slice(2));
} catch (e) {
  // exception will be thrown if there's an error with the meta data
  console.error(e);
}

function convert(r, token) {
  var src = path.resolve(r.args[0] || 'README.md');
  if (!fs.existsSync(src)) {
    console.log(r.help());
    process.exit(1);
  }
  var dest = path.resolve(r.args[1] || src);
  var opt = util._extend(util._extend({}, r.flags), r.parameters);
  toc.add(src, dest, opt);
}
