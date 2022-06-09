import test from "node:test";
import assert from "node:assert/strict";
import bundle from "../src/wp-esbuild-bundler.js";

test("test", (t) => {
  assert.doesNotReject(async () => await bundle({ verbose: true }));
});
