<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>{{default title basename}}</title>
    <link rel="stylesheet" href="http://getbootstrap.com/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="http://getbootstrap.com/docs-assets/css/docs.css">
    <link rel="stylesheet" href="{{assets}}/monokai.css">
    <style>pre {background-color: #222; border: 1px solid #111; padding-bottom: 0;}</style>
  </head>
  <body>
    <div class="container bs-docs-container">
      <div class="content">
        <h2>Table of Contents</h2>
        <ul class="toc">
        <% _.each(toc, function(heading) { %>
        <li>
          <a href="#<%= heading.name %>">
            <%= heading.text %>
          </a>
        </li>
        <% }) %>
        </ul>
        <%= content %>
      </div>
    </div>
    <script src="{{assets}}/highlight.pack.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>
  </body>
</html>