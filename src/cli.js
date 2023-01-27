#!/usr/bin/env -S gjs -m

import Gio from "gi://Gio";
import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib";
import system from "system";
import { render } from "./mermaid.js";

import { decode } from "./util.js";

Gtk.init();

const loop = new GLib.MainLoop(null, false);

const app = new Gio.Application({
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

function showHelp() {
  const [, stdout, stderr] = GLib.spawn_command_line_sync(
    `${system.programInvocationName} --help`,
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
  "<input>",
);

app.add_main_option(
  "output",
  "o",
  GLib.OptionFlags.NONE,
  GLib.OptionArg.FILENAME,
  "Output file. Required",
  "<output>",
);

let input;
let output;

app.connect("handle-local-options", (_self, options) => {
  if (options.contains("version")) {
    print("alpha");
    return 0;
  }

  input = decode(
    options.lookup_value("input", null)?.unpack() || new Uint8Array(),
  );
  output = decode(
    options.lookup_value("output", null)?.unpack() || new Uint8Array(),
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

const [, contents] = input_file.load_contents(null);
const graph = decode(contents);

render(graph)
  .then((result) => {
    output_file.replace_contents(
      result,
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null,
    );
  })
  .catch(logError)
  .finally(() => {
    loop.quit();
  });

loop.run();
