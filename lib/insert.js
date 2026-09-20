'use strict';

var toc = require('..');
var utils = require('./utils');

/**
 * The basic idea:
 *
 *  1. when front-matter exists, we need to avoid turning its properties into headings.
 *  2. We need to detect toc markers on the page. For now it's a simple HTML code comment
 *     to ensure the markdown is compatible with any parser.
 *
 * Only the first `<!-- toc -->` / optional `<!-- tocstop -->` pair is used. Extra
 * markers later in the file (e.g. documentation showing the comment syntax) are
 * left untouched — see #198.
 *
 * @param  {String} `str` Pass a string of markdown
 * @param  {Object} `options` Pass options to toc generation
 * @return {String} Get the same string back with a TOC inserted
 */

module.exports = function insert(str, options) {
  options = options || {};

  var open = typeof options.open === 'string' ? options.open : '<!-- toc -->\n\n';
  var close = typeof options.close === 'string' ? options.close : '<!-- tocstop -->';
  var obj;

  var newlines = '';
  var m = /\n+$/.exec(str);
  if (m) newlines = m[0];

  // does the file have front-matter?
  if (/^---/.test(str)) {
    // extract it temporarily so the syntax
    // doesn't get mistaken for a heading
    obj = utils.matter(str);
    str = obj.content;
  }

  // Custom regex: preserve legacy split behavior for callers that opt in.
  if (options.regex) {
    return legacyInsert(str, options, open, close, obj, newlines);
  }

  var resultString = insertFirstPair(str, options, open, close) + newlines;
  // if front-matter was found, put it back now
  if (obj) {
    return utils.matter.stringify(resultString, obj.data);
  }
  return resultString;
};

/**
 * Honor only the first toc / tocstop pair; leave later markers as literal text.
 */

function insertFirstPair(str, options, open, close) {
  var openRe = /<!--[ \t]*toc[ \t]*-->/;
  var openMatch = openRe.exec(str);
  if (!openMatch) {
    return str;
  }

  var openStart = openMatch.index;
  var openEnd = openStart + openMatch[0].length;
  var afterOpen = str.slice(openEnd);

  // Next marker after the opening comment (toc or tocstop)
  var nextRe = /<!--[ \t]*toc(?:stop)?[ \t]*-->/;
  var nextMatch = nextRe.exec(afterOpen);

  var prefix = str.slice(0, openStart);
  var tocContent;
  var suffix;

  if (nextMatch && /tocstop/.test(nextMatch[0])) {
    // Replace between first <!-- toc --> and its <!-- tocstop -->
    var closeStart = openEnd + nextMatch.index;
    var closeEnd = closeStart + nextMatch[0].length;
    // Drop any stale TOC body that sat between the markers (trimmed like legacy split)
    suffix = str.slice(closeEnd);
    tocContent = options.toc || toc(stripTocMarkers(suffix), options).content;
    return joinSections([prefix, open + tocContent, close, suffix]);
  }

  // Open only (or next marker is another <!-- toc -->): insert after first open,
  // keep the rest of the file — including extra <!-- toc --> — intact.
  suffix = afterOpen;
  tocContent = options.toc || toc(stripTocMarkers(suffix), options).content;
  return joinSections([prefix, open + tocContent + '\n\n' + close, suffix]);
}

/**
 * toc() treats `<!-- toc -->` as a start boundary and drops earlier headings.
 * Extra markers in the body (docs/examples) must not affect generation — #198.
 */
function stripTocMarkers(str) {
  return str.replace(/<!--[ \t]*toc(?:stop)?[ \t]*-->/g, '');
}

/**
 * Legacy multi-split path (throws when more than one TOC pair). Used only when
 * `options.regex` is set, matching historical behavior.
 */

function legacyInsert(str, options, open, close, obj, newlines) {
  var regex = options.regex;
  var sections = split(str, regex);
  if (sections.length > 3) {
    throw new Error('markdown-toc only supports one Table of Contents per file.');
  }

  var last = sections[sections.length - 1];
  if (sections.length === 3) {
    sections.splice(1, 1, open + (options.toc || toc(last, options).content));
    sections.splice(2, 0, close);
  }

  if (sections.length === 2) {
    sections.splice(1, 0, open + toc(last, options).content + '\n\n' + close);
  }

  var resultString = sections.join('\n\n') + newlines;
  if (obj) {
    return utils.matter.stringify(resultString, obj.data);
  }
  return resultString;
}

function joinSections(sections) {
  return sections.map(trim).filter(function(s, i, arr) {
    // Keep empty prefix/suffix only if needed — match legacy trim-then-join
    return true;
  }).join('\n\n');
}

function split(str, re) {
  return str.split(re).map(trim);
}

function trim(str) {
  return str.trim();
}
