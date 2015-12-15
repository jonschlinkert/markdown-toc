'use strict';

/**
 * Module dependencies
 */

var utils = require('./lib/utils');

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
  return new utils.Remarkable()
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
  var opts = utils.merge({firsth1: true, maxdepth: 6}, options);
  var stripFirst = opts.firsth1 === false;

  return function(md) {
    md.renderer.render = function(tokens) {
      tokens = tokens.slice();
      var len = tokens.length, i = 0, num = 0;
      var tocstart = -1;
      var seen = {};
      var arr = [];
      var res = {};

      while (len--) {
        var token = tokens[i++];
        if (/<!--[ \t]*toc[ \t]*-->/.test(token.content)) {
          tocstart = token.lines[1];
        }

        if (token.type === 'heading_open') {
          tokens[i].lvl = tokens[i - 1].hLevel;
          tokens[i].i = num++;
          arr.push(tokens[i]);
        }
      }

      var result = [];
      res.json = [];

      // exclude headings that come before the actual
      // table of contents.
      var alen = arr.length, j = 0;
      while (alen--) {
        var tok = arr[j++];
        if (tok.lines[0] > tocstart) {
          if (!seen.hasOwnProperty(tok.content)) {
            seen[tok.content] = 0;
          } else {
            seen[tok.content]++;
          }

          tok.seen = seen[tok.content];
          res.json.push(utils.pick(tok, ['content', 'lvl', 'i', 'seen']));
          result.push(linkify(tok, opts));
        }
      }

      opts.highest = highest(result);
      res.highest = opts.highest;
      res.tokens = tokens;

      if (stripFirst) result = result.slice(1);
      res.content = bullets(result, opts);
      res.content += (opts.append || '');
      return res;
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

function bullets(arr, options) {
  var opts = utils.merge({indent: '  '}, options);
  opts.chars = opts.chars || opts.bullets || ['-', '*', '+'];
  var unindent = 0;

  var listitem = utils.li(opts);
  var fn = typeof opts.filter === 'function'
    ? opts.filter
    : null;

  // Keep the first h1? This is `true` by default
  if (opts && opts.firsth1 === false) {
    unindent = 1;
  }

  var len = arr.length;
  var res = [];
  var i = 0;

  while (i < len) {
    var ele = arr[i++];
    ele.lvl -= unindent;
    if (fn && !fn(ele.content, ele, arr)) {
      continue;
    }

    var lvl = ele.lvl - opts.highest;
    res.push(listitem(lvl, ele.content, opts));

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
  var res = arr.slice().sort(function(a, b) {
    return a.lvl - b.lvl;
  });
  if (res && res.length) {
    return res[0].lvl;
  }
  return 0;
}

/**
 * Turn headings into anchors
 */

function linkify(tok, opts) {
  if (tok && tok.content) {
    var text = titleize(tok.content, opts);
    var slug = slugify(tok.content, opts);
    if (tok.seen > 0) {
      slug += '-' + tok.seen;
    }

    if (opts && typeof opts.linkify === 'function') {
      return opts.linkify(tok, text, slug, opts);
    }
    tok.content = utils.mdlink(text, '#' + slug);
  }
  return tok;
}

/**
 * Slugify the url part of a markdown link.
 *
 * @name  options.slugify
 * @param  {String} `str` The string to slugify
 * @param  {Object} `opts` Pass a custom slugify function on `slugify`
 * @return {String}
 * @api public
 */

function slugify(str, opts) {
  if (opts && opts.slugify === false) return str;
  if (opts && typeof opts.slugify === 'function') {
    return opts.slugify(str, opts);
  }

  str = str.split('.').join('').toLowerCase();
  return str.replace(/[^a-z0-9]/g, '-');
}

/**
 * Titleize the title part of a markdown link.
 *
 * @name  options.titleize
 * @param  {String} `str` The string to titleize
 * @param  {Object} `opts` Pass a custom titleize function on `titleize`
 * @return {String}
 * @api public
 */

function titleize(str, opts) {
  if (opts && opts.strip) { return strip(str, opts); }
  if (opts && opts.titleize === false) return str;
  if (opts && typeof opts.titleize === 'function') {
    return opts.titleize(str, opts);
  }
  return str;
}

/**
 * Optionally strip specified words from headings.
 *
 * @name  options.strip
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

  if (Array.isArray(opts.strip) && opts.strip.length) {
    var res = opts.strip.join('|');
    var re = new RegExp(res, 'g');
    str = str.trim().replace(re, '');
    return str.replace(/^-|-$/g, '');
  }
  return str;
}

/**
 * Expose utils
 */

toc.bullets = bullets;
toc.linkify = linkify;
toc.slugify = slugify;
toc.titleize = titleize;
toc.strip = strip;
