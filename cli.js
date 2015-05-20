#!/usr/bin/env node

var fs = require('fs');
var concat = require('concat-stream');
var toc = require('./index.js');
var args = require('minimist')(process.argv.slice(2));

if (!args._[0]) {
  console.error('Usage: markdown-toc <file or - for stdin> [--json]');
  process.exit(1);
}

var input = process.stdin;
if (args._[0] !== '-') input = fs.createReadStream(args._[0]);
  
input.pipe(concat(function (input) {
  var parsed = toc(input.toString());
  output(parsed);
}))

input.on('error', function onErr(err) {
  console.error(err);
  process.exit(1);
})

function output (parsed) {
  if (args.json) return console.log(JSON.stringify(parsed.json, null, '  '));
  process.stdout.write(parsed.content);
}
