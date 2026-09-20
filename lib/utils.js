'use strict';

/**
 * Module dependencies
 */

var diacritics = require('diacritics-map');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('concat-stream', 'concat');
require('gray-matter', 'matter');
require('list-item', 'li');
require('markdown-link', 'mdlink');
require('minimist');
require('mixin-deep', 'merge');
require('object.pick', 'pick');
require('remarkable', 'Remarkable');
require('repeat-string', 'repeat');
require('strip-color');
require = fn;

/**
 * Get the "title" from a markdown link
 */

utils.getTitle = function(str) {
  if (/^\[[^\]]+\]\(/.test(str)) {
    var m = /^\[([^\]]+)\]/.exec(str);
    if (m) return m[1];
  }
  return str;
};

/**
 * Slugify the url part of a markdown link.
 *
 * @name  options.slugify
 * @param  {String} `str` The string to slugify
 * @param  {Object} `options` Pass a custom slugify function on `options.slugify`
 * @return {String}
 * @api public
 */


/**
 * Strip HTML tags, but keep the contents of inline code spans so that
 * markdown like `` `<log-in>` `` is not treated as a tag (issue #170).
 */
utils.stripHtmlTags = function(str) {
  var code = [];
  str = str.replace(/`([^`]*)`/g, function(_, body) {
    code.push(body);
    return '`\0' + (code.length - 1) + '\0`';
  });
  str = str.split(/<\/?[^>]+>/).join('');
  str = str.replace(/`\0(\d+)\0`/g, function(_, i) {
    return '`' + code[i] + '`';
  });
  return str;
};

utils.slugify = function(str, options) {
  options = options || {};
  if (options.slugify === false) return str;
  if (typeof options.slugify === 'function') {
    return options.slugify(str, options);
  }

  str = utils.getTitle(str);
  str = utils.stripColor(str);
  str = str.toLowerCase();

  // `.split()` is often (but not always) faster than `.replace()`
  str = str.split(' ').join('-');
  str = str.split(/\t/).join('--');
  if (options.stripHeadingTags !== false) {
    str = utils.stripHtmlTags(str);
  }
  str = str.split(/[|$&`~=\\\/@+*!?({[\]})<>=.,;:'"^]/).join('');
  str = str.split(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/).join('');
  str = replaceDiacritics(str);
  if (options.num) {
    str += '-' + options.num;
  }
  return str;
};

function replaceDiacritics(str) {
  return str.replace(/[À-ž]/g, function(ch) {
    return diacritics[ch] || ch;
  });
}

/**
 * Expose `utils` modules
 */

module.exports = utils;
