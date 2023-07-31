import * as sass from 'sass';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// we cannot use
// import package_json from './../../package.json' assert { type: 'json' };
// since import...assert its not (yet) supported by eslint
const package_json = JSON.parse(readFileSync(dirname(fileURLToPath(import.meta.url)) + '/../../package.json'));

/**
 * Sass plugin for esbuild.
 *
 * Options will be 1:1 mapped to the original sass options.
 * @see https://sass-lang.com/documentation/js-api/interfaces/Options
 *
 * @param   {[type]}  sassOptions
 */
export default function SassPlugin(options = {}) {
  const name = package_json.name + '-sass-plugin';
  return {
    name,
    setup(build) {
      build.onResolve({ filter: /\.scss$/ }, (args) => ({
        path: resolve(args.resolveDir, args.path),
        namespace: name,
      }));
      build.onLoad({ filter: /.*/, namespace: name }, (args) => {
        const esbuildOptions = build.initialOptions;

        /*
         * Please note that Sass options "sourceMap" and "sourceMapIncludeSources"
         * will be correctly handled by Sass itself BUT the resulting sourcemap gets completely ignored.
         * Instead the esbuild sourcemap (generated based on the Sass css output) gets returned.
         *
         * In future releases this may be changed (like this: https://github.com/glromeo/esbuild-sass-plugin/blob/main/src/render.ts)
         */
        const sassOptions = {
          loadPaths: [dirname(args.path)],
          style: esbuildOptions.minify ? 'compressed' : 'expanded',
          sourceMap: !!esbuildOptions.sourcemap,
          sourceMapIncludeSources: !!esbuildOptions.sourcemap,

          ...options,
        };

        const { css, loadedUrls, sourceMap } = sass.compileString(readFileSync(args.path, 'utf8'), sassOptions);

        const contents = css.toString('utf-8');

        // if esbuild watch is enabled :
        // collect all files included by sass into watchFiles
        // and report it to esbuild for watching
        const watchFiles = esbuildOptions.watch && [
          args.path,
          ...loadedUrls.filter((url) => url.protocol === 'file:').map((url) => url.pathname),
        ];

        return {
          contents,
          // watchFiles : see https://github.com/glromeo/esbuild-sass-plugin/blob/9759a6ff4b698acd7126b7237a10ff549b43389b/src/plugin.ts#L86
          watchFiles,
          loader: 'css',
        };
      });
    },
  };
}
