#!/usr/bin/env -S NODE_NO_WARNINGS=1 node

import { cwd } from "node:process";
import { parseArgs, inspect } from "node:util";
import bundle from "../src/wp-esbuild-bundler.js";

function extractPrefixedOptions(args, prefix) {
  return Object.fromEntries(
    Object.entries(args)
      .filter(([key, value]) => key.startsWith(prefix))
      .map(([key, value]) => [key.substring(prefix.length), value]),
  );
}

const ARGS = {
  options: {
    watch: {
      type: "boolean",
      short: "w",
    },
    verbose: {
      type: "boolean",
      short: "v",
    },
    mode: {
      type: "string",
    },
    banner: {
      type: "string",
    },
    footer: {
      type: "string",
    },
    outdir: {
      type: "string",
    },
  },
  allowPositionals: true,
  strict: false,
};

const args = parseArgs(ARGS);

console.log("args = %s", JSON.stringify(args, null, 2));

const expose = extractPrefixedOptions(args.values, "expose:");
const options = {
  verbose: args.values.verbose,
  mode: args.values.mode === "development" ? "development" : "production",
  // use both positional arguments and expose option keys as entryPoints
  entryPoints: [...new Set([...Object.keys(expose), ...args.positionals])],
  outdir: args.values.outdir ?? cwd(),
  expose,
  banner: extractPrefixedOptions(args.values, "banner:"),
  footer: extractPrefixedOptions(args.values, "footer:"),
  watch: args.values.watch,
  sass: {},
};

debugger
console.log("options = %s", JSON.stringify(options, null, 2));

await bundle(options);
