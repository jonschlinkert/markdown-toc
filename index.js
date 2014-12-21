/*!
 * markdown-toc <https://github.com/jonschlinkert/markdown-toc>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var Remarkable = require('remarkable');
var extend = require('extend-shallow');
var mdu = require('markdown-utils');

/**
 * Expose `toc`
 */

module.exports = toc;


function toc(str, options) {
  return new Remarkable()
    .use(generate(options))
    .render(str);
}


/**
 * Generate a markdown table of contents.
 *
 * @param {Object} `options`
 * @return {String}
 * @api private
 */

function generate(options) {
  var opts = extend({firsth1: true, maxdepth: 6}, options);

  return function(md) {
    md.renderer.render = function (tokens) {
      var len = tokens.length;
      var tocstart = -1;
      var res = [];
      var i = 0;
      var h = 0;

      while (len--) {
        var token = tokens[i++];

        if (/<!--[ \t]*toc[ \t]*-->/.test(token.content)) {
          tocstart = token.lines[1];
        }

        if (token.type === 'heading_open') {
          var lvl = tokens[i].lvl = tokens[i - 1].hLevel;

          // Keep the first h1? This is `true` by default
          if(opts.firsth1 === false) {
            // lvl -= 1;
            if (++h === 1) {
              continue;
            }
          }

          // if `lvl` is greater than the max depth
          if(lvl > opts.maxdepth) {
            break;
          }
          res.push(tokens[i]);
        }
      }

      // exclude headings that come before the actual
      // table of contents.
      res = res.reduce(function(acc, token) {
        if (token.lines[0] > tocstart) {
          acc.push(token);
        }
        token = linkify(token, opts);
        return acc;
      }, []);

      opts.highest = highest(res);
      return {
        highest: opts.highest,
        content: bullets(res, opts),
        tokens: tokens
      };
    };
  };
}

/**
 * Get the highest heading level in the array, so
 * we can un-indent the proper number of levels.
 *
 * @param {Array} `arr` Array of tokens
 * @return {Number} Highest level
 * @api private
 */

function highest(arr) {
  return arr.slice().sort(function(a, b) {
    return a.lvl > b.lvl;
  })[0].lvl;
}

function linkify(ele, opts) {
  var slug = slugify(ele.content, opts);
  var text = strip(ele.content, opts);

  if (opts && typeof opts.linkify === 'function') {
    return opts.linkify(ele, slug, opts);
  }

  ele.content = mdu.link(text, '#' + slug);
  return ele;
}

function slugify(str, opts) {
  if (opts && typeof opts.slugify === 'function') {
    return opts.slugify(str, opts);
  }
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function strip(str, opts) {
  if (opts && typeof opts.strip === 'function') {
    return opts.strip(str, opts);
  }

  var words = opts.strip || [];
  var len = words.length;
  var i = 0;

  while (len--) {
    var word = words[i++];
    var re = '-*' + word + '-*';
    str = str.replace(new RegExp(re), '').trim();
  }
  return str;
}

function bullets(arr, opts) {
  return arr.map(function(ele) {
    return mdu.listitem(ele.content, ele.lvl, opts);
  }).join('\n');
}
