#!/usr/bin/env node

var fs = require('fs');
var toc = require('./index.js');
var utils = require('./lib/utils');
var args = utils.minimist(process.argv.slice(2), {
  boolean: ['i', 'json'],
  string: ['slug-prefix']
});

if (args._.length !== 1) {
  console.error([
    'Usage: markdown-toc [--json] [-i] [--slug-prefix <prefix>] <input> ',
    '',
    '  input:   The markdown file to parse for table of contents,',
    '          or "-" to read from stdin.',
    '',
    '  --json: Print the TOC in json format',
    '',
    '  -i:     Edit the <input> file directly, injecting the TOC at <!-- toc -->',
    '          (Without this flag, the default is to print the TOC to stdout.)',
    '',
    '  --slug-prefix <prefix>:',
    '          Add <prefix> to the generated slugs.'
  ].join('\n'));
  process.exit(1);
}

if (!args.i && !args.json) {
    console.error('markdown-toc: you must specify either --json or -i');
    process.exit(1);
}

if (args.i && args.json) {
  console.error('markdown-toc: you cannot use both --json and -i');
  process.exit(1);
}

if (args.i && args._[0] === '-') {
  console.error('markdown-toc: you cannot use -i with "-" (stdin) for input');
  process.exit(1);
}

var input = process.stdin;
if (args._[0] !== '-') input = fs.createReadStream(args._[0]);

input.pipe(utils.concat(function(input) {
  options = {};
  if (args['slug-prefix']) {
    options['slug_prefix'] = args['slug-prefix'];
  }

  if (args.i) {
    var newMarkdown = toc.insert(input.toString(), options);
    fs.writeFileSync(args._[0], newMarkdown);
  } else {
    var parsed = toc(input.toString(), options);
    output(parsed);
  }
}));

input.on('error', function onErr(err) {
  console.error(err);
  process.exit(1);
});

function output(parsed) {
  if (args.json) return console.log(JSON.stringify(parsed.json, null, '  '));
  process.stdout.write(parsed.content);
}
