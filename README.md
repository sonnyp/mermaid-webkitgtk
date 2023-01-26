# Mermaid WebkitGTK renderer

[Mermaid](https://mermaid.js.org/) is a Markdown-inspired syntax to create diagrams.
It provides a browser/JavaScipt API which can render to SVG.

There is [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) which uses the JavaScript API in [Puppeteer](http://pptr.dev/).

This is an alternative and lighter renderer making use of WebKitGTK.

It is written in JavaScript/GJS but it should be trivial to translate it to an other GObject binding enabled language.

## Usage

```
> ./mermaid.js --help
```

At the moment it only supports the `input` and `ouput` parameters of `mermaid-cli`.

Contributions welcome.

```sh
> ./mermaid.js -i input.mmd -o output.svg
```

## License

ISC
