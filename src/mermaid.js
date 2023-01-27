#!/usr/bin/env -S gjs -m

import Gio from "gi://Gio";
import WebKit from "gi://WebKit2?version=5.0";
import GLib from "gi://GLib";

const file = Gio.File.new_for_path("./mermaid@9.0.3/mermaid.min.js");
const mermaid_source = new TextDecoder().decode(file.load_contents(null)[1]);
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <script>${mermaid_source}</script>
</head>
<body>
</body>
</html>
`.trim();

export function render(graph) {
  return new Promise((resolve, reject) => {
    const web_view = new WebKit.WebView({
      "is-ephemeral": true,
    });

    web_view.connect("load-changed", (_self, load_event) => {
      if (load_event !== WebKit.LoadEvent.FINISHED) return;
      onLoadFinished();
    });

    function onLoadFinished() {
      const id = `mermaid-${GLib.random_int()}`;
      const script = `mermaid.mermaidAPI.render("${id}", \`${graph.replaceAll(
        "`",
        "\\`",
      )}\`);`;

      web_view.run_javascript(script, null, (_self, async_result) => {
        let result;
        try {
          const javascript_result =
            web_view.run_javascript_finish(async_result);
          const javascipt_value = javascript_result.get_js_value();
          result = javascipt_value.to_string();
        } catch (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    }

    web_view.load_html(html, null);
  });
}
