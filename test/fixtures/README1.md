# grunt-readme [![NPM version](https://badge.fury.io/js/grunt-readme.png)](http://badge.fury.io/js/grunt-readme) 

> Grunt plugin for generating a README from templates, including an optional table of contents. No Gruntfile config is necessary, just choose a starter template and you'll be ready to go.

## Getting Started


## The "readme" task

### Overview


### Options
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
Default: `./node_modules/grunt-readme/tasks/templates/README.tmpl.md`

By default, if no options are specified the task will look for a `README.md.tmpl` template to use, if none is found the task will use the "starter" file supplied by `grunt-readme` (more detail below). Example:

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
1. If (4) is undefined, the task uses the "starter" README template from `grunt-readme`.


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

Override the default directory for files included using `{%= _.doc('foo.md') %}`. This defaults to the `./docs` directory in the root of your project.

```js
readme: {
  options: {
    docs: 'foo/'
  }
}
```


#### templates
Type: `String`
Default: `./node_modules/grunt-readme/tasks/templates/` (relative to your project)

Override the default `cwd` for files included by using `{%= _.include('foo.md') %}`. By default, the `include` mixin will look for files in `./node_modules/grunt-readme/tasks/templates` directory, where some starter templates are stored. ([Also see examples →](./DOCS.md#examples))

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
## {%= _.titleize(_.shortname(name)) %}
```

will renders to:

```
## Module
```

### contributing
Type: `Boolean`
Default: `True`

By default, the README task copies a basic `CONTRIBUTING.md` file to the root of your project. If one exists, the task will skip this. If you wish to prevent the task from adding this file to your project, set the `contributing` option to `false`.


### sep
Type: `String`
Default: `\n`

Separator to use between sections of content that is included using the `include` or `doc` mixins (more about these in the "Mixins" section below). This option is more useful when you use [minimatch][] patterns to specify the files to include.

The `sep` option can either be defined in the task options:

```js
readme: {
  options: {
    sep: '\n***\n'
  }
}
```

or as a second parameter in the `include` or `doc` mixins.

* `{%= _.include("docs-*.md", "***") %}` (more below...)
* `{%= _.doc("*.md", "\n***\n") %}` (more below...)

[minimatch]: https://github.com/isaacs/minimatch



### Usage Examples
## Template Examples

> Copy/paste any of these examples into your templates as a starting point.


### Name

```js
{%= name %}
```
> grunt-readme


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
>  | https://github.com/assemble/grunt-readme
> * https://github.com/assemble/grunt-readme
>
>  * @docs https://github.com/assemble/grunt-readme\n



### [AUTHORS](NPM https://npmjs.org/doc/json.html)

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
 * grunt-readme v0.1.3,  2013-09-22
 * https://github.com/assemble/grunt-readme
 * Copyright (c) 2013 [object Object], contributors.
 * Released under the MIT license.
 */

### Changelog / Release History

```js
{%= _.include("docs-changelog.md") %}
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


***

## Contributing
Find a bug? Have a feature request? Please [create an Issue](https://github.com/assemble/grunt-readme/issues).

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][], and build the documentation with [grunt-readme](https://github.com/assemble/grunt-readme).

Pull requests are also encouraged, and if you find this project useful please consider "starring" it to show your support! Thanks!


## Release History

 * 2013-11-15   v0.3.5   Repos task is now a separate grunt plugin. Adds basic badge mixins and lots of new test fixtures to test templates and mixins.
 * 2013-11-15   v0.3.0   Updates function that reads in metadata from options to accept mixed formats.
 * 2013-11-08   v0.2.4   Adds table of contents generation. Just use `{%= toc %}` where you want it to go.
 * 2013-11-03   v0.2.2   Fixes the function for the `metadata` option. Externalizes advanced docs since no config is really needed for this task.
 * 2013-10-11   v0.1.9   Adds ability to specify multiple metadata files in yaml or json format.
 * 2013-09-21   v0.1.3   Completely refactored. Adds a lot of documentation.
 * 2013-09-19   v0.1.0   First commmit.


## Other Grunt tasks
+ [assemble](http://assemble.io): Static site generator for Grunt.js, Yeoman and Node.js. Used by H5BP/Effeckt, Topcoat, Web Experience Toolkit, and hundreds of other projects to build sites, themes, components, documentation, blogs and gh-pages.
Here are some related projects you might be interested in from the [Assemble](http://assemble.io) core team.

+ [grunt-convert](https://github.com/assemble/grunt-convert): Grunt task to convert to or from JSON, YAML, XML, PLIST or CSV. 
+ [grunt-firebase](https://github.com/assemble/grunt-firebase): Grunt task for updating firebase data. 
+ [grunt-github-api](https://github.com/assemble/grunt-github-api): Grunt plugin used to query the Github API and save the returned JSON files locally. 
+ [grunt-matter](https://github.com/assemble/grunt-matter): Add, extend, sort, and strip YAML front matter. Also has options for populating randomized mock data. 
+ [grunt-repos](https://github.com/assemble/grunt-repos): Use Grunt to pull down a list of repos from GitHub. 
+ [grunt-toc](https://github.com/assemble/grunt-toc): Grunt plugin for generating a markdown Table of Contents (TOC). 

Visit [assemble.io/plugins](http:/assemble.io/plugins/) for more information about [Assemble](http:/assemble.io/) plugins.



## Authors


## License
Copyright (c) 2013 Jon Schlinkert, contributors.
Released under the MIT license

***

_This file was generated by [grunt-readme](https://github.com/assemble/grunt-readme) on Saturday, December 14, 2013._

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html
