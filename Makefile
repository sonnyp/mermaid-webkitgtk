.PHONY: build test

build:
	npm install
	cp node_modules/mermaid/dist/mermaid.min.js lib/mermaid.js

test: build
	./src/cli.js --input input.mmd --output output.svg
	pandoc -t html -F ./src/pandoc-filter.js -o example.html example.md
