#!/usr/bin/env NODE_NO_WARNINGS=1 node
# #!/usr/bin/env -S NODE_NO_WARNINGS=1 node
import { cwd } from "node:process";
import { parseArgs, inspect } from "node:util";
import bundle from "../src/wp-esbuild-bundler.js";

import package_json from '../package.json' assert {type: 'json'}
/*
function extractPrefixedOptions(args, prefix) {
  return Object.fromEntries(
    Object.entries(args)
      .filter(([key, value]) => key.startsWith(prefix))
      .map(([key, value]) => [key.substring(prefix.length), value]),
  );
}
*/
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
    target: {
      type: "string",
      multiple:true,
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

if(args.values.verbose) {
  console.log("args = %s", JSON.stringify(args, null, 2));
}

const options = {
  verbose: args.values.verbose,
  mode: args.values.mode === "development" ? "development" : "production",
  entryPoints: args.positionals,
  wordpress: {},//extractPrefixedOptions(args.values, "wordpress."),
  outdir: args.values.outdir ?? cwd(),
  target: args.values.target ?? 'esnext',
  banner: args.values.banner,
  footer: args.values.footer,
  watch: args.values.watch,
  sass: {},
};

if(args.values.verbose) {
  console.log("options = %s", JSON.stringify(options, null, 2));
}

if(args.values.help || !args.positionals.length) {

  console.log(`${package_json.name} ${package_json.version}

${package_json.description}

This software is licensed under terms of ${package_json.license} license.

Syntax: ${package_json.name} [options] file1.jsx file2.mjs ...

Options:
--watch/-w                      
  
  Listen for changes on the file system and to rebuild whenever a file changes that could invalidate the build.

--verbose/-v                    
  
  Produces more verbose log output.

--mode=[production|development] 
  
  (default=production) Produces a production (*.min.*) or development version of bundled js/css code.   

--banner=<string>               
  
  (default='') Use this to insert an arbitrary string at the beginning of generated JavaScript and CSS files. 

--footer=<string>               
  
  (default='') Use this to insert an arbitrary string at the end of generated JavaScript and CSS files.

--target=<string>               
  
  (default='esnext', multiple) Target environments for the generated JavaScript and/or CSS code (see https://esbuild.github.io/api/#target).

--outdir=<path>                 
  
  (default=cwd())This option sets the output directory for the build operation.

If you want to declare more individual configurations, checkout the JS API.
`);
} else {
  await bundle(options);
}
