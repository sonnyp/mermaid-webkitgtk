#!/usr/bin/env -S gjs -m

import GLib from "gi://GLib";
import * as pandoc from "../lib/pandoc-filter.js";
import system from "system";
import Gtk from "gi://Gtk?version=4.0";
import getStdin from "./get-stdin.js";

import { render } from "./mermaid.js";

const loop = new GLib.MainLoop(null, false);

Gtk.init();

globalThis.process = {
  argv: [system.programInvocationName, system.programArgs],
  stdout: {
    write(data) {
      print(data);
    },
  },
};

async function mermaid({ t: type, c: value }) {
  if (type !== "CodeBlock") return null;

  if (value[0][1][0] !== "mermaid") return null;

  const graph = value[1];

  const svg = await render(graph);

  return pandoc.Para([pandoc.RawInline("html", svg)]);
}

getStdin()
  .then(async (stdin) => {
    const data = JSON.parse(stdin);
    const output = await pandoc.filter(data, mermaid);
    print(JSON.stringify(output));
  })
  .catch(logError)
  .finally(() => loop.quit());

loop.run();
