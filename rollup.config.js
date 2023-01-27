import commonjs from "@rollup/plugin-commonjs";
import ignore from "rollup-plugin-ignore";
import executable from "rollup-plugin-executable";
import shebang from "rollup-plugin-preserve-shebang";

export default [
  {
    input: "node_modules/pandoc-filter/index.js",
    output: {
      file: "lib/pandoc-filter.js",
    },
    plugins: [commonjs(), ignore(["get-stdin"])],
  },
  {
    input: "src/cli.js",
    output: {
      file: "dist/mermaid-webkitgtk-cli",
    },
    plugins: [executable(), shebang()],
  },
  {
    input: "src/pandoc.js",
    output: {
      file: "dist/mermaid-webkitgtk-filter",
    },
    plugins: [executable(), shebang()],
  },
];
