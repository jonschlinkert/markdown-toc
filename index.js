/*
 * marked-toc
 * https://github.com/jonschlinkert/marked-toc, inspired by:
 * https://github.com/jquery/grunt-jquery-content/blob/master/tasks/build.js
 *
 * Copyright (c) 2013 Jon Schlinkert
 * Licensed under the MIT license.
 */

'use strict';

var marked = require("marked");
var _      = require("lodash");
var Utils  = require("./lib/utils");

var makeTOC = function (src) {
  var toc    = "";
  var tokens = marked.lexer(src);

  // Remove the very first h1
  tokens.shift();

  var indent = _.any(tokens, {depth: 1});

  tokens.filter(function (item) {
    // Filter out everything but headings
    if (item.type !== "heading") {
      return false;
    }

    // Since we removed the first h1, we'll check to see if other h1's
    // exist. If none exist, then we unindent the rest of the TOC
    if(!indent) {
      item.depth = item.depth - 1;
    }

    // Store original text and create an id for linking
    item.headingText = item.text.replace(/(\s*\[!|(?:\[.+ →\]\()).+/g, '');
    item.headingId   = Utils.slugify(item.headingText);

    var arr = ['Table of Contents', 'TOC', 'TABLE OF CONTENTS'];
    if (isMatch(arr, item.headingText)) {
      return;
    }

    return true;
  }).forEach(function (item) {
    toc += new Array((item.depth - 1) * 2 + 1).join(" ") + "* " +
      "[" + item.headingText + "](#" + item.headingId + ")\n";
  });
  return toc.replace(/\s*\*\s*\[\].+/g, '');
};

var isMatch = function (keywords, str) {
  keywords = Array.isArray(keywords) ? keywords : [keywords];
  keywords = (keywords.length > 0) ? keywords.join('|') : '.*';
  var re = new RegExp('(?:' + keywords + ')', 'g');
  if (String(str).match(re)) {
    return true;
  } else {
    return false;
  }
};

module.exports = makeTOC;