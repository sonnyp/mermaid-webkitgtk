import commonjs from "@rollup/plugin-commonjs";
import ignore from "rollup-plugin-ignore";

export default [
  {
    input: "node_modules/pandoc-filter/index.js",
    output: {
      file: "lib/pandoc-filter.js",
    },
    plugins: [commonjs(), ignore(["get-stdin"])],
  },
];
