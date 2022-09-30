import esbuild from "esbuild";
import WordPressGlobalsPlugin from "./plugins/wordpress.js";
import SassPlugin from "./plugins/sass.js";

export default async function bundle(options) {
  const esbuild_options = {
    entryPoints: options.entryPoints,
    bundle: true,
    // assume mjs files contains jsx syntax
    loader: {
      ".mjs": "jsx",
      ".js": "jsx",
    },
    platform: "browser",

    // . The default target is esnext which means that by default, esbuild will assume all of the latest JavaScript features are supported.
    target: options.target ?? "esnext", 
    
    banner: options.banner,
    footer: options.footer,

    define: {
      "process.env.NODE_ENV": `"${
        options.mode === "development" ? "development" : "production"
      }"`,
    },
    jsxFragment: "window.wp.element.Fragment",
    jsxFactory: "window.wp.element.createElement",
    outdir: options.outdir,
    outExtension: {
      ".js": (options.mode === "development" ? "" : ".min") + ".js",
      ".css": (options.mode === "development" ? "" : ".min") + ".css",
    },
    minify: options.mode !== "development",
    sourcemap: options.mode === "development" ? "inline" : false,
    metafile: true,
    plugins: [SassPlugin(options.sass), WordPressGlobalsPlugin(options.globals)],
    watch: options.watch,
  };

  const result = await esbuild.build(esbuild_options);

  return await esbuild.analyzeMetafile(result.metafile, {
    verbose: options.verbose,
  });
}
