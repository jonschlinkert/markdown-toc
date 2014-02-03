/**
 * marked-toc <https://github.com/jonschlinkert/marked-toc>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var utils = module.exports = {};

utils.arrayify = function(arr) {
  return !Array.isArray(arr) ? [arr] : arr;
};

utils.escapeRegex = function(re) {
  return re.replace(/(\[|\]|\(|\)|\/|\.|\^|\$|\*|\+|\?)/g, '\\$1');
};

utils.isDest = function(dest) {
  return !dest || dest === 'undefined' || typeof dest === 'object';
};

utils.isMatch = function (keywords, str) {
  keywords = Array.isArray(keywords) ? keywords : [keywords];
  keywords = (keywords.length > 0) ? keywords.join('|') : '.*';

  // Escape certain characters, like '[', '('
  var k = utils.escapeRegex(String(keywords));

  // Build up the regex to use for replacement patterns
  var re = new RegExp('(?:' + k + ')', 'g');
  if (String(str).match(re)) {
    return true;
  } else {
    return false;
  }
};

utils.sanitize = function(src) {
  src = src.replace(/(\s*\[!|(?:\[.+ →\]\()).+/g, '');
  src = src.replace(/\s*\*\s*\[\].+/g, '');
  return src;
};

utils.slugify = function(str) {
  str = str.replace(/\/\//g, '-');
  str = str.replace(/\//g, '-');
  str = str.replace(/\./g, '-');
  str = _.str.slugify(str);
  str = str.replace(/^-/, '');
  str = str.replace(/-$/, '');
  return str;
};

/**
 * @param  {[type]} name The name to be modified
 * @return {[type]}      The "clean" version of the name
 * @example: "grunt-readme" => "readme"
 * @example: "helper-foo" => "foo"
 */
var blacklist = ['grunt', 'helper', 'handlebars-helper', 'mixin', 'filter', 'assemble-contrib', 'assemble'];

utils.clean = function (name, options) {
  var opts = _.extend({}, options);
  if(opts.blacklist === false) {blacklist = [];}
  var exclusions = _.union(blacklist, utils.arrayify(opts.clean || []));
  var re = new RegExp('^(?:' + exclusions.join('|') + ')[-_]?', 'g');
  return name.replace(re, '');
};