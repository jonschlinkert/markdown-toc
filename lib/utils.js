'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('minimist');
require('remarkable', 'Remarkable');
require('repeat-string', 'repeat');
require('markdown-link', 'mdlink');
require('concat-stream', 'concat');
require('gray-matter', 'matter');
require('object.pick', 'pick');
require('mixin-deep', 'merge');
require('list-item', 'li');
require('strip-color');
require = fn;

/**
 * Get the "title" from a markdown link
 */

utils.getTitle = function(str) {
if (/^\[/.test(str) && /\]\(/.test(str)) {
    var m = /^\[([^\]]+)\]/.exec(str);
    if (m) return m[1];
  }
  return str;
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
