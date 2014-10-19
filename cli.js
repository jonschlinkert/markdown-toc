#!/usr/bin/env node

var path = require('path');
var toc = require('./');

var src = path.resolve(process.argv[2] || path.resolve('README.md'));
var dest = path.resolve(process.argv[3] || src);

toc.add(src, dest);