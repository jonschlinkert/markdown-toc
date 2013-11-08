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
var Utils = require("./lib/utils");

var makeTOC = function (src) {
  var toc    = "";
  var tokens = marked.lexer(src);
  var links  = tokens.links;

  tokens.filter(function (item) {
    if (item.type !== "heading") {
      return false;
    }
    // Store original text and create an id for linking
    item.headingText = item.text.replace(/(\s*\[!|(?:\[.+ →\]\()).+/g, '');
    item.headingId   = Utils.slugify(item.headingText);
    return true;
  }).forEach(function (item) {
    toc += new Array((item.depth - 1) * 2 + 1).join(" ") + "* " +
      "[" + item.headingText + "](#" + item.headingId + ")\n";
  });
  return toc.replace(/\s*\*\s*\[\].+/g, '');
};

module.exports = makeTOC;