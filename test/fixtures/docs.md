# Documentation

**Table of Contents**
* [Overview](#overview)
* [Advanced configuration](#advanced-configuration)
* [Features](#features)
* [Options](#options)
* [filters](#filters)
* [Examples](#examples)
* [Contributing](#contributing)
* [Authors](#authors)
* [License](#license)


## Overview
In general, the conventions used by this task are as follows:

**Templates**
* Files with extension `.tmpl.md` are generally templates that will be compiled one-to-one into documents
* Files with extension `.md` are generally intended to be used as includes.
* `{%= docs("foo") %}` is used to included files from your project's `./docs` directory
* `{%= include("foo") %}` is used to include boilerplate files from phaser

## Advanced configuration
To change the plugin's defaults, add a section to your project's Gruntfile named `function (name, options) {
    var opts = _.extend({}, phaserOpts, options);
    return phaser.utils.safename(name, opts);
  }` to the data object passed into `grunt.initConfig()`:

```js
grunt.initConfig({
  // The "repos" task
  repos: {
    options: {}
  },

  // The "readme" task
  readme: {
    options: {
      metadata: {}
    }
  }
});
grunt.loadNpmTasks('phaser');
grunt.registerTask('default', ['readme']);
```

## Features
### templates

### Readme template

* `docs/`
* `node_modules/grunt-readme/templates/`
* `options.readme`
* `options.resolve.readme`


### YAML Front Matter
Add YAML front matter to documents to extend the metadata that is supplied to your project's templates.

```yaml
---
username: jonschlinkert
---
```
This is probably most useful when:
1. You need to use the same or similar templates on a number of different projects
1. You want to supply data to the templates that won't typically be found in package.json


### Code Comments
Code comments used in markdown templates will be stripped from the rendered files as long as they adhere to the following syntax:

```handlebars
// Whitespace inside comments is insignificant
{{!-- foo --}}
{{! foo }}
```

### Escaping

#### Escaping hashes
This task automatically adjusts heading levels in included templates. For example, `#` is adjusted to `##`, so that heading levels "line up" properly after the README is built.

This can cause problems if you're using hashes for a reason other than headings, such as CSS Id's in code comments. So to prevent phaser from converting `#id {}` to `##id {}`, just add a  single backtick before the hash: <code>`#id {}</code>.

#### Escaping Lo-Dash templates
To prevent Lo-Dash from attempting to evaluat templates that shouldn't be (_as with code examples_), just use square brackets instead of curly braces in any templates that have similar patterns to these: `{%= .. %}`, `{%- .. %}`, and `{% .. %}`. The square brackets will be replaced with curly braces in the rendered output.


## Options
### Overview of available options

[Also see examples →](./DOCS.md#examples)
```js
readme: {
  options: {
    readme: '',
    templates: '',
    metadata: '',
    sep: '\n',
    prefixes: [],
    contributing: true
  }
}
```

### readme
Type: `String`
Default: `./node_modules/phaser/tasks/templates/README.tmpl.md`

By default, if no options are specified the task will look for a `README.md.tmpl` template to use, if none is found the task will use the "starter" file supplied by `phaser` (more detail below). Example:

```js
readme: {
  options: {
    readme: 'path/to/custom/README.md.tmpl'
  }
}
```

1. If the `readme` options is defined, the task will use that custom template.
1. If (1) is undefined, the task uses the directory defined by `options: { docs: ''}`
1. If (2) is undefined, the task checks if `README.tmpl.md` exists in the `./docs` directory (without having to define it in the options)
1. if (3) is undefined, `options: { resolve: { readme: ''}}` attempts to automagically use a `README.tmpl.md` template from `node_modules`. The module must must be defined in `devDependencies`. Note that for a README template to resolve properly from `node_modules`, the `main` property in the `package.json` of the module being referenced must specify the path to the template. This option is probably most useful when you plan to use the same README template on a number of projects.
1. If (4) is undefined, the task uses the "starter" README template from `phaser`.


### metadata
Type: `Object`
Default: `package.json`

Optional source of metadata to _extend the data object_ that is passed as context into the templates. Context of the data object is the value of `this`, and properties in `package.json` will be ignored when matching properties are defined on the `metadata` object. Example:

```js
readme: {
  options: {
    metadata: {
      name: 'Foo',
      description: 'This is foo.'
    }
  }
}
```

#### data files

Or specify the path or paths to any `.json` or `.yml` files to use. Any of the following formats will work:

```js
readme: {
  options: {
    metadata: 'docs/metadata.json'
  }
}
```

Array of files:

```js
readme: {
  options: {
    metadata: ['docs/one.json', 'docs/two.yml'],
  }
}
```

[minimatch][] (wilcard/globbing) patterns:

```js
readme: {
  options: {
    metadata: ['docs/*.{json,yml}', 'foo.json']
  }
}
```


Since context is the value of "this", the `metadata` path is not required in templates, only property names:

* `{%= name %}` (e.g. not `{%= metadata.name %}`) => `Foo`
* `{%= description %}` => `This is foo.`



#### docs
Type: `String`
Default: `./docs/`

Override the default directory for files included using `{%= docs('foo.md') %}`. This defaults to the `./docs` directory in the root of your project.

```js
readme: {
  options: {
    docs: 'foo/'
  }
}
```


#### templates
Type: `String`
Default: `./node_modules/phaser/tasks/templates/` (relative to your project)

Override the default `cwd` for files included by using `{%= include('foo.md') %}`. By default, the `include` mixin will look for files in `./node_modules/phaser/tasks/templates` directory, where some starter templates are stored. ([Also see examples →](./DOCS.md#examples))

```js
readme: {
  options: {
    templates: 'bar/'
  }
}
```


### remove
Type: `Array`
Default: `grunt|helper|mixin`

Any string defined in the remove will be removed from the content passed in using the `{%= _.shortname() %}` template. Example:

```js
readme: {
  options: {
    remove: ["foo", "bar", "baz"]
  }
}
```

Given a `package.json` with the following property:

```json
{
  "name": "foo-module"
}
```

when referenced in a template like this:

```js
# {%= _.titleize(_.shortname(name)) %}
```

will renders to:

```
# Module
```

### contributing
Type: `Boolean`
Default: `True`

By default, the README task copies a basic `CONTRIBUTING.md` file to the root of your project. If one exists, the task will skip this. If you wish to prevent the task from adding this file to your project, set the `contributing` option to `false`.


### sep
Type: `String`
Default: `\n`

Separator to use between sections of content that is included using the `include` or `doc` filters (more about these in the "filters" section below). This option is more useful when you use [minimatch][] patterns to specify the files to include.

The `sep` option can either be defined in the task options:

```js
readme: {
  options: {
    sep: '\n***\n'
  }
}
```

or as a second parameter in the `include` or `doc` filters.

* `{%= include("docs-*.md", "***") %}` (more below...)
* `{%= docs("*.md", "\n***\n") %}` (more below...)

[minimatch]: https://github.com/isaacs/minimatch


## filters


## Examples
## Template Examples

> Copy/paste any of these examples into your templates as a starting point.


### Name

```js
{%= name %}
```
> phaser


### Version

```js
{%= version %}
v{%= version %}
{%= version ? " v" + version : "" %}
{%= version ? " * @version " + version + "\\n" : "" %}
```
> 0.1.3
> v0.1.3
> v0.1.3
> * @version 0.1.3\n

### Description

```js
{%= description %}
{%= description ? " * " + description + "\\n" : "" %}
```
> Generate your README from a template. If you already use Grunt, this is a no brainer.
> * Generate your README from a template. If you already use Grunt, this is a no brainer.\n



### Homepage

```js
{%= homepage ? " | " + homepage : "" %}
{%= homepage ? " * " + homepage + "\n" : "" %}
{%= homepage ? " * @docs " + homepage + "\\n" : "" %}
```
>  | https://github.com/assemble/phaser
> * https://github.com/assemble/phaser
>
>  * @docs https://github.com/assemble/phaser\n



### AUTHORS

[AUTHORS](NPM https://npmjs.org/doc/json.html)

> If there is an `AUTHORS` file in the root of your package, npm will treat each line as a `Name <email> (url)` format, where email and url are optional. Lines which start with a # or are blank, will be ignored. **[-- NPM]((NPM https://npmjs.org/doc/json.html)**

To use `author` data from `package.json`:

```js
[{%= author.name %}]({%= author.url %})
```
> [Jon schlinkert](http://github.com/jonschlinkert)

```js
{%= author.name ? " * @author " + author.name + "\\n" : "" %}
{%= author.url ? " * @link " + author.url + "\\n" : "" %}
```
>  * @author Jon Schlinkert\n
>  * @link https://github.com/jonschlinkert\n

Or, if you prefer to use an `AUTHORS` file in the root of the project:

```js
[{%= authors[0].name %}]({%= authors[0].url %})
```
> [Jon schlinkert](http://github.com/jonschlinkert)
> [Brian Woodward](http://github.com/doowb)


### Time and date

```js
{%= grunt.template.today() %}
```
> Tue Sep 17 2013 18:38:42

```js
{%= grunt.template.today("yyyy") %}
```
> 2013

```js
{%= grunt.template.today("yyyy-mm-dd") %}
```
> 2013-09-17

```js
_This file was generated on {%= grunt.template.date("fullDate") %}._
```
> _This file was generated on Monday, September 30, 2013._


### Banner

```js
/*!
 * {%= name %} v{%= version %},  {%= grunt.template.today("yyyy-mm-dd") %}
 * {%= homepage %}
 * Copyright (c) {%= grunt.template.today("yyyy") %} {%= author %}, contributors.
 * {%= _.license() %}.
 */
```

> /*!
 * phaser v0.1.3,  2013-09-22
 * https://github.com/assemble/phaser
 * Copyright (c) 2013 [object Object], contributors.
 * Released under the MIT license.
 */

### Changelog / Release History

```js
{%= include("docs-changelog.md") %}
```

> * 2013-09-21   **v0.1.3**   Completely refactored. Adds a lot of documentation.
 * 2013-09-19   **v0.1.0**   First commmit.


Or:

```js
 * {%= grunt.template.today('yyyy') %}   v0.1.0   First commit
```
> * 2013   v0.1.0   First commit



### License

```
{%= _.license() %}
```
> Released under the [MIT license](./LICENSE-MIT).



### Contributors

```js
{%= _.contributors() %}
```
> Jon Schlinkert
> Brian Woodward


### Metadata

You can mix and match formats in the `metadata` option, all of the following shoulw work:

```js
grunt.initConfig({
  pkg: 'package.json',
  foo: 'package.json',
  bar: grunt.file.readJSON('package.json'),
  qux: grunt.file.readJSON('test/fixtures/data/one.json'),
  baz: ['<%= bar %>'],

  config: {
    one: 'test/fixtures/data/one.json',
    two: 'test/fixtures/data/two.yml',
    three: 'test/fixtures/data/three.json',
    pkg: grunt.file.readJSON('package.json'),
    qux: grunt.file.readJSON('test/fixtures/data/one.json')
  },


  // Obviously you can't have duplicate properties on an
  // object, so this is just for illustrative purposes
  // The point is.. you can get just about as crazy as you want.
  readme: {
    options: {
      metadata: ['<%= pkg %>', '<%= qux %>'],
      metadata: ['<%= config.pkg %>', '<%= config.qux %>'],
      metadata: ['<%= pkg %>', {foo: 'bar'}],
      metadata: ['<%= pkg %>', 'test/fixtures/data/*.{json,yml}'],
      metadata: '<%= config.one %>',
      metadata: 'test/fixtures/data/one.json',
      metadata: ['test/fixtures/data/one.json', 'test/fixtures/data/two.yml'],
      metadata: ['test/fixtures/data/two.yml', {description: 'Foo', name: 'Bar'}, '<%= pkg %>', 'test/fixtures/data/*.json', {alpha: 1, beta: 2 }, {kappa: 3, gamma: 4 }, {zed: {orange: 5, apple: 6 } }, '<%= config.one %>', {name: 'New'}, {quux: '<%= qux %>'}, ['one', {pkg: '<%= config.pkg %>'}, 'three'], {arr: ['one', 'two', 'three']}],
      metadata: ['<%= config.one %>', '<%= config.two %>'], metadata: 'test/fixtures/data/*.{json,yml}',
      metadata: ['test/fixtures/data/*.{json,yml}'],
      metadata: ['test/fixtures/data/*.json', 'test/fixtures/data/*.yml'],
      metadata: ['test/fixtures/data/*.json', '<%= config.two %>'],
      metadata: {
        description: 'Foo',
        name: 'Bar'
      }
    }
  }
}
```

## Contributing
Find a bug? Have a feature request? Please [create an Issue](https://github.com/assemble/phaser/issues).

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][], and build the documentation with [grunt-readme](https://github.com/assemble/grunt-readme).

Pull requests are also encouraged, and if you find this project useful please consider "starring" it to show your support! Thanks!

## Authors

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2014 Jon Schlinkert, contributors.
Released under the MIT license

***

