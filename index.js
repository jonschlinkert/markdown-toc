/*!
 * markdown-toc <https://github.com/jonschlinkert/markdown-toc>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var Remarkable = require('remarkable');
var mdu = require('markdown-utils');
var any = require('any');


module.exports = function toc(str, options) {
  return new Remarkable()
    .use(generate(options))
    .render(str);
};


function generate(options) {
  options = options || {firsth1: true};

  return function(md) {
    md.renderer.render = function (tokens) {
      var len = tokens.length;
      var tocstart = -1;
      var result = [];
      var i = 0;
      var h = 0;

      while (len--) {
        var token = tokens[i++];

        if (/<!--[ \t]*toc[ \t]*-->/.test(token.content)) {
          tocstart = token.lines[1];
        }

        if (token.type === 'heading_open') {
          tokens[i].lvl = tokens[i - 1].hLevel;
          h++;

          // Keep the very first h1, true by default
          if(options.firsth1 === false) {
            if (h === 1) {continue;}
          }

          tokens[i].lvl
          result.push(tokens[i]);
        }
      }

      result = result.reduce(function(acc, token) {
        if (token.lines[0] > tocstart) {
          acc.push(token);
        }

        token = linkify(token, options);
        return acc;
      }, []);

      options.highest = result.slice().sort(function(a, b) {
        return a.lvl > b.lvl;
      })[0].lvl;

      return bullets(result, options);
    };
  };
}

function linkify(ele, options) {
  var slug = slugify(ele.content, options);
  if (options && typeof options.linkify === 'function') {
    return options.linkify(ele, slug, options);
  }
  ele.content = mdu.link(ele.content, '#' + slug);
  return ele;
}

function slugify(str, options) {
  if (options && typeof options.slugify === 'function') {
    return options.slugify(str, options);
  }
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function bullets(arr, opts) {
  return arr.map(function(ele) {
    return listitem(ele.content, ele.lvl, opts);
  }).join('\n');
}


var repeat = require('repeat-string');

/**
 * Create a markdown-formatted listitem.
 *
 * ```js
 * utils.item('Level 0 list item', 0);
 * //=> '* Level 0 list item'
 *
 * utils.item('Level 1 list item', 1);
 * //=> '  * Level 1 list item'
 *
 * utils.item('Level 2 list item', 2);
 * //=> '    * Level 2 list item'
 * ```
 *
 * @name listitem
 * @param  {String} `str`
 * @param  {Number} `level`
 * @param  {String} `bullet` default `*`
 * @api public
 */

function listitem(str, level, opts) {
  var ch = opts && opts.bullets || ['-', '*', '+', '~'];
  var lvl = level - opts.highest;

  var depth = lvl > 0
    ? repeat('  ', lvl)
    : '';

  var bullet = ch[(lvl) % ch.length];
  return depth
    + (bullet ? bullet : '*')
    + ' ' + str;
}
