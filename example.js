
var fs = require('fs');
var toc = require('./');
var content = fs.readFileSync('test/fixtures/basic.md', 'utf8');



console.log(toc(content));
