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
var utils  = require("./lib/utils");

module.exports = function(src) {
  var toc    = "";
  var tokens = marked.lexer(src);

  // Remove the very first h1
  tokens.shift();

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
    token.headingText = token.text.replace(/(\s*\[!|(?:\[.+ →\]\()).+/g, '');
    token.headingId   = utils.slugify(token.headingText);

    // console.log(token);

    var arr = ['Table of Contents', 'TOC', 'TABLE OF CONTENTS'];
    if (utils.isMatch(arr, token.headingText)) {
      return;
    }

    return true;
  }).forEach(function (token) {
    toc += new Array((token.depth - 1) * 2 + 1).join(" ") + "* " +
      "[" + token.headingText + "](#" + token.headingId + ")\n";
  });
  return toc.replace(/\s*\*\s*\[\].+/g, '');
};