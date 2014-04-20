/**
 * marked-toc <https://github.com/jonschlinkert/marked-toc>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

const glob = require('globule');
const _ = require('lodash');


module.exports = function (src, options) {
  var opts = _.extend({sep: '\n', prefixBase: true}, options);
  opts.cwd = opts.cwd || process.cwd();
  return glob.find(src, opts);
};
