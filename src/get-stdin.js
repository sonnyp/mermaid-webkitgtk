import GLib from "gi://GLib";
import Gio from "gi://Gio";

import { decode } from "./util.js";

export default async function getStdin() {
  Gio._promisify(Gio.OutputStream.prototype, "splice_async", "splice_finish");

  const input_stream = new Gio.UnixInputStream({ fd: 0 });
  const output_stream = Gio.MemoryOutputStream.new_resizable();

  await output_stream.splice_async(
    input_stream,
    Gio.OutputStreamSpliceFlags.CLOSE_TARGET |
      Gio.OutputStreamSpliceFlags.CLOSE_SOURCE,
    GLib.PRIORITY_DEFAULT,
    null,
  );

  const bytes = output_stream.steal_as_bytes();
  return decode(bytes.toArray());
}

/*

// To test, uncomment the following and run with
// > echo foobar | gjs -m src/get-stdin.js

const loop = new GLib.MainLoop(null, false);
getStdin()
  .then(print)
  .catch(logError)
  .finally(() => {
    loop.quit();
  });
loop.run();

*/
