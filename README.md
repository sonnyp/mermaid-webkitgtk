# Mermaid WebkitGTK renderer

[Mermaid](https://mermaid.js.org/) is a Markdown-inspired syntax to create diagrams.
It provides a browser/JavaScipt API which can render to SVG.

This is a collection of utils to use WebkitGTK to render mermaid graphs.

## CLI

There is [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) which uses the JavaScript API in [Puppeteer](http://pptr.dev/).

This is an alternative and lighter renderer making use of WebKitGTK.

```
> ./src/cli --help
```

At the moment it only supports the `input` and `ouput` parameters of `mermaid-cli`.

```sh
> ./src/cli.js --input input.mmd --output output.svg
```

## Pandoc filter

Here is an example of a pandoc command which takes a markdown file as input and outputs an html file.

And use the filter here to turn mermaid code blocks into inline SVGs.

```sh
> pandoc -t html -F ./src/pandoc-filter.js -o example.html example.md
```

## Contributing

```sh
make
# make changes
make test
```

## License

ISC
