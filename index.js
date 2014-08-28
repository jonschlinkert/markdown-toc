/**
 * marked-toc <https://github.com/jonschlinkert/marked-toc>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

const file     = require('fs-utils');
const marked   = require('marked');
const matter   = require('gray-matter');
const template = require('template');
const uslug    = require('uslug');
const _        = require('lodash');

const utils  = require('./lib/utils');



// Default template to use for TOC
var defaultTemplate = '<%= depth %><%= bullet %>[<%= heading %>](#<%= url %>)\n';


var generate = function(str, options) {
  var opts = _.extend({
    firsth1: false,
    blacklist: true,
    omit: [],
    maxDepth: 3,
    slugify: function(text) {
      return uslag(text, {allowedChars: '-'} || this);
    }
  }, options);

  var toc = '';
  var tokens = marked.lexer(str);
  var tocArray = [];

  // Remove the very first h1, true by default
  if(opts.firsth1 === false) {
    tokens.shift();
  }

  // Do any h1's still exist?
  var h1 = _.any(tokens, {depth: 1});

  tokens.filter(function (token) {
    // Filter out everything but headings
    if (token.type !== 'heading' || token.type === 'code') {
      return false;
    }

    // Since we removed the first h1, we'll check to see if other h1's
    // exist. If none exist, then we unindent the rest of the TOC
    if(!h1) {
      token.depth = token.depth - 1;
    }

    // Store original text and create an id for linking
    token.heading = opts.clean ? utils.clean(token.text, opts) : token.text;

    // Create a "slugified" id for linking
    token.id = opts.slugify(token.text);

    // Omit headings with these strings
    var omissions = ['Table of Contents', 'TOC', 'TABLE OF CONTENTS'];
    var omit = _.union([], opts.omit, omissions);

    if (utils.isMatch(omit, token.heading)) {
      return;
    }

    return true;
  }).forEach(function (h) {

    if(h.depth > opts.maxDepth) {
      return;
    }

    var data = _.extend({}, opts.data, {
      depth  : new Array((h.depth - 1) * 2 + 1).join(' '),
      bullet : opts.bullet ? opts.bullet : '* ',
      heading: h.heading,
      url    : h.id
    });

    tocArray.push(data);

    var tmpl = opts.template || defaultTemplate;
    toc += template(tmpl, data);
  });

  return {
    data: tocArray,
    toc: opts.clean ? utils.clean(toc, opts) : toc
  };
};


/**
 * toc
 */

var toc = module.exports = function(str, options) {
  return generate(str, options).toc;
};


toc.raw = function(str, options) {
  return generate(str, options);
};


toc.insert = function(str, options) {
  var start = '<!-- toc -->';
  var stop  = '<!-- toc stop -->';
  var strip = /<!-- toc -->[\s\S]+<!-- toc stop -->/;

  var content = matter(str).content;
  var front   = matter.extend(str);

  // Remove the existing TOC
  content = content.replace(strip, start);

  // Generate the new TOC
  var table = '\n\n' + start + '\n\n' + toc(content, options) + '\n' + stop + '\n';
  return front + content.replace(start, table);
};


// Read a file and add a TOC, dest is optional.
toc.add = function(src, dest, options) {
  var opts = _.extend({clean: ['docs']}, options || {});
  var content = file.readFileSync(src);
  if (utils.isDest(dest)) {options = dest; dest = src;}
  file.writeFileSync(dest, toc.insert(content, opts));
  console.log(' Success:', dest);
};
