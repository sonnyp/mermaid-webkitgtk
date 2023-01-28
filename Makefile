.PHONY: build lint test

build:
	npm install
	cp node_modules/mermaid/dist/mermaid.min.js lib/mermaid.js

lint:
	./node_modules/.bin/rome ci src

test: build lint
	./src/cli.js --input input.mmd --output output.svg
	pandoc -t html -F ./src/pandoc-filter.js -o example.html example.md
