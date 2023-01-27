# Mermaid WebkitGTK renderer

[Mermaid](https://mermaid.js.org/) is a Markdown-inspired syntax to create diagrams.
It provides a browser/JavaScipt API which can render to SVG.

This is a collection of utils to use WebkitGTK to render mermaid graphs.

## CLI

There is [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) which uses the JavaScript API in [Puppeteer](http://pptr.dev/).

This is an alternative and lighter renderer making use of WebKitGTK.

```
> ./dist/mermaid-webkitgtk-cli --help
```

At the moment it only supports the `input` and `ouput` parameters of `mermaid-cli`.

```sh
> ./dist/mermaid-webkitgtk-cli --input input.mmd --output output.svg
```

## Pandoc filter

Here is an example of a pandoc command which takes a markdown file as input and outputs an html file.

And use the filter here to turn mermaid code blocks into inline SVGs.

```sh
> pandoc -t html -F ./dist/mermaid-webkitgtk-filter -o example.html example.md
```

## Contributing

Install development dependencies with `npm install`.

Make changes, test with `./src/cli.js` or `./src/pandoc`.

When you're done, run `npm test && npx rollup -c rollup.config.js` to update `dist`.

## License

ISC
