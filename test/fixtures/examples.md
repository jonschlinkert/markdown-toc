## Examples

### Example config with [Assemble](http://assemble.io)

In your project's Gruntfile, options for the `{{readme}}` helper can be defined in the Assemble task options:

```js
assemble: {
  options: {
    helpers: ['handlebars-helper-readme'],
    readme: {
      cwd: 'path/to/files',
      sep: '<!-- separator defined in Gruntfile -->',
      compare: function (a, b) {
        return a.index >= b.index ? 1 : -1;
      }
    }
  },
  files: {}
}
```

## Usage example

Given you have this config in your project's gruntfile:

```js
// Project configuration.
grunt.initConfig({

  // Metadata for our book.
  book: require('./metadata/book.yml'),

  assemble: {
    options: {
      helpers: ['handlebars-helper-readme'],
      readme: {
        sep: '<!-- chapter -->'
      },
      book: {
        src: ['chapters.hbs'],
        dest: 'book/'
      }
    }
  }
});
```

Our `chapters.hbs` file contains the following:

```handlebars
{{{readme 'chapters/*.hbs'}}}
```

And the files we want to readme include these Lo-Dash and Handlebars templates:

```handlebars
---
title: <%= book.title %>
chapter: 1
intro: Chapter <%= chapter %>
---
<h1>Content from {{title}}</h1>
<p class="intro">{{intro}}</p>
<p class="chapter">Chapter: {{chapter}}</p>
```

The result, `book/chapters.html` would contain something like:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My Amazing Book</title>
  </head>
  <body>

    <!-- chapter -->
    <h1>Content from My Amazing Book</h1>
    <p class="intro">Chapter 1</p>
    <p class="chapter">Chapter: 1</p>

    <!-- chapter -->
    <h1>Content from My Amazing Book</h1>
    <p class="intro">Chapter 2</p>
    <p class="chapter">Chapter: 2</p>

    <!-- chapter -->
    <h1>Content from My Amazing Book</h1>
    <p class="intro">Chapter 3</p>
    <p class="chapter">Chapter: 3</p>
  </body>
</html>
```

#### `cwd` example

Instead of writing out full paths, like this:

```handlebars
{{readme 'my/book/chapters/*.hbs'}}
{{readme 'my/book/extras/*.hbs'}}
```

Just define a `cwd` in the `readme` options in your project's Gruntfile:

```javascript
assemble: {
  options: {
    helpers: ['handlebars-helper-readme'],
    readme: {
      cwd: 'my/book' // "base" path to prepend
    }
  }
}
```

Now you can define paths in the templates like this:

```handlebars
{{readme 'chapters/*.hbs'}}
{{readme 'extras/*.hbs'}}
```