#!/usr/bin/env -S NODE_NO_WARNINGS=1 node --
import { cwd } from "node:process";
import { parseArgs, inspect } from "node:util";
import { readFileSync } from "node:fs";
import merge from 'lodash.merge';
import bundle from "../src/wp-esbuild-bundle.js";

import package_json from '../package.json' assert {type: 'json'}

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
    'global-name' : {
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
// @TODO : apply defaults after reading config from stdin
const arg_options = {
  verbose: args.values.verbose,
  mode: args.values.mode === "development" ? "development" : "production",
  entryPoints: args.positionals,
  //wordpress: {},//extractPrefixedOptions(args.values, "wordpress."),
  outdir: args.values.outdir ?? cwd(),
  target: args.values.target ?? 'esnext',
  banner: args.values.banner,
  footer: args.values.footer,
  watch: args.values.watch,
  //sass: {},
};

if(args.values['global-name']) {
  arg_options['global-name'] = args.values['global-name'];
}

let stdinContent = '{}';
try {
  stdinContent = readFileSync(process.stdin.fd, 'utf-8');
  if(args.values.verbose) {
    console.log("readed stdin content = %s", stdinContent);
  }
} catch {
  if(args.values.verbose) {
    console.log("Skip reading config from stdin : no content available from stdin");
  }
}

const options = {};
try {
  merge(options, JSON.parse(stdinContent));
} catch(ex) {
  console.error("stdin content is not valid json : %s\n%s", ex.message, stdinContent);
  process.exit(-1);
}

merge(options, arg_options);

if(options.verbose) {
  console.log("wp-esbuild-bundle options = %s", JSON.stringify(options, null, 2));
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

--global-name=<string>

  (default=undefined) Sets the name of the global variable which is used to store the exports from the entry point.
  Can only be used if a single file gets transpiled (see https://esbuild.github.io/api/#global-name)

--outdir=<path>                 
  
  (default=cwd())This option sets the output directory for the build operation.

Bundle options like package mappings can be specified using a JSON config provided via stdin
Example:  
  echo '{ "wordpress" : { "mappings" : { "@cm4all/foo" : "window.cm4all.foo" } }}' | wp-esbuild-bundle-cli --outdir dist foo.js

If you want to declare more individual configurations, checkout the JS API.
`);
} else {
  const metadata = await bundle(options);
  if(options.verbose) {
    console.log(metadata);
  }
}
