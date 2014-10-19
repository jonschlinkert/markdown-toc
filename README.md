# marked-toc [![NPM version](https://badge.fury.io/js/marked-toc.png)](http://badge.fury.io/js/marked-toc)

> Generate a TOC (table of contents) for markdown files

_(example)_
<!-- toc -->
* [Getting Started](#getting-started)
* [Usage](#usage)
* [Options](#options)
  * [template](#template)
  * [bullet](#bullet)
  * [maxDepth](#maxdepth)
  * [firsth1](#firsth1)
  * [omit](#omit)
  * [clean](#clean)
  * [blacklist](#blacklist)
  * [allowedChars](#allowedchars)
* [API](#api)
  * [toc](#toc)
  * [toc.insert](#tocinsert)
  * [toc.add](#tocadd)
  * [toc.raw](#tocraw)
* [Contributing](#contributing)
* [Author](#author)
* [License](#license)

<!-- toc stop -->

## Getting Started

Install the module with [npm](npmjs.org):

```bash
npm i -g marked-toc --save
```

In any markdown file, add `<!-- toc -->` where you want to add the TOC. Then in the command line, run:

```bash
toc [filename]
```

If you add the toc to a `README.md`, no need to add `[filename]`, just run `toc`.


## Usage

```javascript
var toc = require('marked-toc');
var file = fs.readFileSync('README.md', 'utf8');

// Generate a TOC
toc(file);
```

## Options

All methods accept an object of options as the last argument.

### template

Type: `String`

Default: `<%= depth %><%= bullet %>[<%= heading %>](#<%= url %>)\n`

The Lo-Dash template used to generate the Table of Contents.

**Example (this is the default):**

```js
var tmpl = '<%= depth %><%= bullet %>[<%= heading %>](#<%= url %>)\n';
toc(file, {template: tmpl});
```

### bullet

Type: `String`

Default: `* `

The bullet to use for each item in the generated TOC. This is passed as a variable to the `<%= bullet %>` template.


### maxDepth

Type: `Number`

Default: `3`

Use headings whose depth is at most maxDepth.


### firsth1

Type: `Boolean`

Default: `False`

Include the first h1-level heading in a file. For example, this prevent the first heading in a README from showing up in the TOC.


### omit

Type: `Array`

Default: `['Table of Contents', 'TOC', 'TABLE OF CONTENTS']`

Omit entire headings from the TOC if they have these strings.

### clean

Type: `Array`

Default: `['mixin', 'helper', 'filter']`

Strip "blacklisted" keywords from the headings.

**Example:**

```js
toc(file, {clean: ['docs', 'methods']});
```

converts this:

```markdown
## docs-foo
Foo

## methods-bar
Bar

```
to:

```markdown
* [foo](#docs-foo)
* [bar](#methods-bar)

```

### blacklist

Type: `Boolean`

Default: `true`

An array of strings used the `omit` option:

```js
['grunt', 'helper', 'handlebars-helper', 'mixin', 'filter', 'assemble-contrib', 'assemble']
```

_(These strings are used a lot in documentation headings, but (usually) shouldn't show up in the gererated TOC.)_


### allowedChars

Type: `String`

Default: `-`

String of chars that you want to be whitelisted when headings are "slugified" for links, e.g. `-_~`.

**Example:**

```markdown
// This heading
# Getting Started

// Converts to this link
* [Getting Started](#getting-started)

```

## API

Most methods expect a string as the first paramter, so unless otherwise noted, assume that each example gets the `str` variable from:


```js
var str = fs.readFileSync('README.md', 'utf8')
```

### toc

Generates a Table of Contents from a string.

```js
// Generate a TOC
var table = toc(str);
fs.writeFileSync('toc.md', table);
```

### toc.insert

Inject a TOC at the insertion point in a string, `<!-- toc -->`.

**Params:**

* `str`: the content
* `options`: object of options

```js
toc.insert(str, options);
```

### toc.add

1. Read a file and inject a TOC at the specified insertion point, `<!-- toc -->`,
2. Write the file to the specified `dest`, _(or re-write back to the source file if no `dest` is passed)_

```js
toc.add(src, dest, options)
```

**Example:**

```js
toc.add('path/to/source.md', 'path/to/dest.md');
```

**Source only:**

```js
toc.add('README.md');
```

### toc.raw

Output a "raw" (JSON) Table of Contents **object**, for customization and usage in templates

```js
toc.raw(str, options);
```

Returns an object (JSON) with two properties, `data` and `toc`:

* `data`: array of headings and associated properties used to construct a TOC. **TIP**: this can be extended with properties, such as src path etc.
* `toc`: the actual Table of Contents result, as a string

**Example:**

```json
{
  // Array of
  "data": [
    {
      "depth": "",
      "bullet": "* ",
      "heading": "Getting Started",
      "url": "getting-started"
    },
    {
      "depth": "",
      "bullet": "* ",
      "heading": "Usage",
      "url": "usage"
    }
  ],

  // String. the actual TOC
  "toc": "* [Getting Started](#getting-started)\n* [Options](#options)\n* [Contributing](#contributing)\n"
}
```

See [an example](./examples/toc.json).


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint your code using [jshint](jshint.com) and run tests with `mocha -R spec` before making a pull request.

## Author

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2014 Jon Schlinkert, contributors
Licensed under the MIT license.
