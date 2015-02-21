/*!
 * markdown-toc <https://github.com/jonschlinkert/markdown-toc>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Module dependencies
 */

var Remarkable = require('remarkable');
var extend = require('extend-shallow');
var mdu = require('markdown-utils');
var pick = require('object.pick');

/**
 * expose `toc`
 */

module.exports = toc;

/**
 * Load `generate` as a remarkable plugin and
 * expose the `toc` function.
 *
 * @param  {String} `str` String of markdown
 * @param  {Object} `options`
 * @return {String} Markdown-formatted table of contents
 */

function toc(str, options) {
  return new Remarkable()
    .use(generate(options))
    .render(str);
}

/**
 * Expose `insert` method
 */

toc.insert = require('./lib/insert');

/**
 * Generate a markdown table of contents. This is the
 * function that does all of the main work with Remarkable.
 *
 * @param {Object} `options`
 * @return {String}
 */

function generate(options) {
  var opts = extend({firsth1: true, maxdepth: 6}, options);

  return function(md) {
    md.renderer.render = function (tokens) {
      tokens = tokens.slice();
      var res = [], i = 0;
      var len = tokens.length;
      var tocstart = -1;

      while (len--) {
        var token = tokens[i++];
        if (/<!--[ \t]*toc[ \t]*-->/.test(token.content)) {
          tocstart = token.lines[1];
        }

        if (token.type === 'heading_open') {
          tokens[i].lvl = tokens[i - 1].hLevel;
          res.push(tokens[i]);
        }
      }

      var results = [];
      var json = [];

      // exclude headings that come before the actual
      // table of contents.
      res.forEach(function(token) {
        if (token.lines[0] > tocstart) {
          json.push(pick(token, ['content', 'lvl']));
          results.push(linkify(token, opts));
        }
      });

      opts.highest = highest(results);
      return {
        tokens: tokens,
        highest: opts.highest,
        content: bullets(results, opts),
        json: json
      };
    };
  };
}

/**
 * Render markdown list bullets
 *
 * @param  {Array} `arr` Array of listitem objects
 * @param  {Object} `opts`
 * @return {String}
 */

function bullets(arr, opts) {
  var unindent = 0;

  // Keep the first h1? This is `true` by default
  if(opts && opts.firsth1 === false) {
    unindent = 1;
    arr.shift();
  }

  var len = arr.length;
  var res = [];
  var i = 0;

  while (i < len) {
    var ele = arr[i++];
    ele.lvl -= unindent;

    res.push(mdu.listitem(ele.content, ele.lvl, opts));
    if (ele.lvl === opts.maxdepth) {
      break;
    }
  }

  return res.join('\n');
}

/**
 * Get the highest heading level in the array, so
 * we can un-indent the proper number of levels.
 *
 * @param {Array} `arr` Array of tokens
 * @return {Number} Highest level
 */

function highest(arr) {
  return arr.slice().sort(function(a, b) {
    return a.lvl - b.lvl;
  })[0].lvl;
}

/**
 * Turn headings into anchors
 */

function linkify(ele, opts) {
  var slug = slugify(ele.content, opts);
  var text = strip(ele.content, opts);

  if (opts && typeof opts.linkify === 'function') {
    return opts.linkify(ele, slug, opts);
  }

  ele.content = mdu.link(text, '#' + slug);
  return ele;
}

/**
 * Slugify links.
 *
 * @param  {String} `str` The string to slugify
 * @param  {Object} `opts` Pass a custom slugify function on `slugify`
 * @return {String}
 */

function slugify(str, opts) {
  if (opts && opts.slugify === false) return str;
  if (opts && typeof opts.slugify === 'function') {
    return opts.slugify(str, opts);
  }
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Optionally strip specified words from headings.
 *
 * @param  {String} `str`
 * @param  {String} `opts`
 * @return {String}
 */

function strip(str, opts) {
  opts = opts || {};

  if (!opts.strip) return str;
  if (typeof opts.strip === 'function') {
    return opts.strip(str, opts);
  }

  var res = opts.strip.join('|');
  var re = new RegExp(res, 'g');
  str = str.trim().replace(re, '');
  return str.replace(/^-|-$/g, '');
}

/**
 * Expose utils
 */

toc.bullets = bullets;
toc.linkify = linkify;
toc.slugify = slugify;
toc.strip = strip;
