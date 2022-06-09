import sass from "sass";
import package_json from "./../../package.json" assert { type: "json" };
import { resolve, dirname } from "node:path";
import { readFileSync } from "node:fs";

export default function SassPlugin() {
  const name = package_json.name + "-sass-plugin";
  return {
    name,
    setup(build) {
      build.onResolve({ filter: /\.scss$/ }, (args) => ({
        path: resolve(args.resolveDir, args.path),
        namespace: name,
      }));
      build.onLoad({ filter: /.*/, namespace: name }, (args) => {
        const esbuildOptions = build.initialOptions;

        const { css, loadedUrls } = sass.compileString(
          readFileSync(args.path, "utf8"),
          {
            loadPaths: [dirname(args.path)],

            // see options here : https://sass-lang.com/documentation/js-api#options
            // includePaths: ["node_modules/breakpoint-sass/stylesheets"],

            outputStyle: esbuildOptions.minify ? "compressed" : "expanded",
            sourceMap: esbuildOptions.sourcemap,
            sourceComments: esbuildOptions.sourcemap,
            sourceMapContents: esbuildOptions.sourcemap,
            sourceMapEmbed: esbuildOptions.sourcemap,
          },
        );

        // if esbuild watch is enabled :
        // collect all files included by sass into watchFiles
        // and report it to esbuild for watching
        const watchFiles = esbuildOptions.watch && [
          args.path,
          ...loadedUrls
            .filter((url) => url.protocol === "file:")
            .map((url) => url.pathname),
        ];

        return {
          contents: css.toString("utf-8"),
          // watchFiles : see https://github.com/glromeo/esbuild-sass-plugin/blob/9759a6ff4b698acd7126b7237a10ff549b43389b/src/plugin.ts#L86
          watchFiles,
          loader: "css",
        };
      });
    },
  };
}
