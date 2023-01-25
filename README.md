# Mermaid WebkitGTK renderer

[Mermaid](https://mermaid.js.org/) is a Markdown-inspired syntax to create diagrams.

It provides a browser/JavaScipt API which can render to SVG.
There is [mermaid-cli](https://github.com/mermaid-js/mermaid-cli) which uses the JavaScript API in [Puppeteer](http://pptr.dev/).

This is an alternative and lighter renderer making use of WebKitGTK.

It is written in JavaScript/GJS but it should be trivial to translate it to an other GObject binding enabled language.

## Usage

It only takes a single argument with is the mermaid graph definition.
The SVG string outputs to `stdout`.

```sh
> ./mermaid.js "graph TD\nA[Client] --> B[Load Balancer]\nB --> C[Server1]\nB --> D[Server2]"
```

## License

ISC
