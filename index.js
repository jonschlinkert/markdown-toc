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
    item.text = [
      '<h' + item.depth + ' class="docs-heading">',
      '  <a href="#"' + item.headingId + ' id="' + item.headingId + '" class="anchor">',
      '    <span class="glyphicon glyphicon-link"></span>',
      '  </a> ',
      '  ' + item.text,
      '</h' + item.depth + '>'
    ].join('\n');
    return true;
  }).forEach(function (item) {
    toc += new Array((item.depth - 1) * 2 + 1).join(" ") + "* " +
      "[" + item.headingText + "](#" + item.headingId + ")\n";
  });
  tokens = marked.lexer(toc).concat(tokens);
  tokens.links = links;
  return toc.replace(/\s*\*\s*\[\].+/g, '');
};

module.exports = makeTOC;