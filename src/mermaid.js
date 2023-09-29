#!/usr/bin/env -S gjs -m

import Gio from "gi://Gio";
import WebKit from "gi://WebKit?version=6.0";
import GLib from "gi://GLib";

import { decode } from "./util.js";

const file = Gio.File.new_for_uri(import.meta.url)
  .get_parent()
  .resolve_relative_path("../lib/mermaid.js");
const mermaid_source = decode(file.load_contents(null)[1]);
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
    const network_session = WebKit.NetworkSession.new_ephemeral();
    const web_view = new WebKit.WebView({
      network_session,
    });

    web_view.connect("load-changed", (_self, load_event) => {
      if (load_event !== WebKit.LoadEvent.FINISHED) return;
      onLoadFinished();
    });

    function onLoadFinished() {
      const id = `mermaid-${GLib.random_int()}`;
      const script = `mermaid.mermaidAPI.render("${id}", \`${graph.replaceAll(
        "`",
        "\\`"
      )}\`);`;

      web_view.evaluate_javascript(
        script, // script
        -1, // length
        null, // world_name
        null, // source_uri
        null, // cancellable
        (_self, async_result) => {
          let result;
          try {
            result = web_view
              .evaluate_javascript_finish(async_result)
              ?.to_string();
          } catch (err) {
            reject(err);
            return;
          }

          resolve(result);
        }
      );
    }

    web_view.load_html(html, null);
  });
}
