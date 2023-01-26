#!/usr/bin/env -S gjs -m

import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";
import WebKit from "gi://WebKit2?version=5.0";
import GLib from "gi://GLib";
import system from "system";

Gtk.init();

function decode(data) {
  return new TextDecoder().decode(data);
}

const loop = new GLib.MainLoop(null, false);

const web_view = new WebKit.WebView({
  "is-ephemeral": true,
});

const app = new Gio.Application({
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

function showHelp() {
  const [, stdout, stderr] = GLib.spawn_command_line_sync(
    `${system.programInvocationName} --help`
  );

  if (stdout) {
    print(decode(stdout));
  } else if (stderr) {
    printerr(decode(stderr));
  }
}

app.add_main_option(
  "input",
  "i",
  GLib.OptionFlags.NONE,
  GLib.OptionArg.FILENAME,
  "Input mermaid file. Required",
  "<input>"
);

app.add_main_option(
  "output",
  "o",
  GLib.OptionFlags.NONE,
  GLib.OptionArg.FILENAME,
  "Output file. Required",
  "<output>"
);

let input;
let output;

app.connect("handle-local-options", (_self, options) => {
  if (options.contains("version")) {
    print("alpha");
    return 0;
  }

  input = decode(
    options.lookup_value("input", null)?.unpack() || new Uint8Array()
  );
  output = decode(
    options.lookup_value("output", null)?.unpack() || new Uint8Array()
  );

  return -1;
});

app.connect("activate", () => {
  if (!input) {
    showHelp();
    system.exit(0);
  }
});

app.run([system.programInvocationName].concat(system.programArgs));

const input_file = Gio.File.new_for_path(input);
const output_file = Gio.File.new_for_path(output);

web_view.connect("load-changed", (_self, load_event) => {
  if (load_event !== WebKit.LoadEvent.FINISHED) return;
  onLoadFinished();
});

function onLoadFinished() {
  const [, contents] = input_file.load_contents(null);
  const graph = decode(contents);

  const id = `mermaid-${GLib.random_int()}`;
  const script = `mermaid.mermaidAPI.render("${id}", \`${graph.replaceAll(
    "`",
    "\\`"
  )}\`);`;

  web_view.run_javascript(script, null, (_self, async_result) => {
    let result;
    try {
      const javascript_result = web_view.run_javascript_finish(async_result);
      const javascipt_value = javascript_result.get_js_value();
      result = javascipt_value.to_string();
    } catch (err) {
      logError(err);
      system.exit(1);
    }

    output_file.replace_contents(
      result,
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null
    );
    loop.quit();
  });
}

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
`;
web_view.load_html(html, null);

loop.run();
