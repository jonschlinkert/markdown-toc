# marked-toc [![NPM version](https://badge.fury.io/js/marked-toc.png)](http://badge.fury.io/js/marked-toc)

> Generate a TOC (table of contents) for markdown files, using the [marked.js](https://github.com/chjj/marked) lexer and parser.

## Getting Started
Install the module with: `npm install marked-toc`

```javascript
var makeTOC = require('marked-toc');
var file = makeTOC(fs.readFileSync('README.md'), 'utf8');
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Author

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2013 Jon Schlinkert
Licensed under the MIT license.

***

_This file was generated on Fri Nov 08 2013 12:09:56._
