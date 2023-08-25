/* eslint-disable no-console */
import esbuild from 'esbuild';
import WordPressGlobalsPlugin from './plugins/wordpress.js';
import SassPlugin from './plugins/sass.js';
import merge from 'lodash.merge';

export default async function bundle(options) {
  const esbuild_options = options.esbuild ?? {};

  const bundler_options = {
    entryPoints: options.entryPoints,
    bundle: true,
    // assume mjs files contains jsx syntax
    loader: {
      '.mjs': 'jsx',
      '.js': 'jsx',
      '.svg': 'text',
    },
    platform: 'browser',

    // . The default target is esnext which means that by default, esbuild will assume all of the latest JavaScript features are supported.
    target: options.target ?? 'esnext',

    banner: options.banner,
    footer: options.footer,

    define: {
      'process.env.NODE_ENV': `"${options.mode === 'development' ? 'development' : 'production'}"`,
    },
    jsxFragment: 'window.wp.element.Fragment',
    jsxFactory: 'window.wp.element.createElement',
    outdir: options.outdir,
    outExtension: {
      '.js': (options.mode === 'development' ? '' : '.min') + '.js',
      '.css': (options.mode === 'development' ? '' : '.min') + '.css',
    },
    minify: options.mode !== 'development',
    sourcemap: options.mode === 'development' ? 'inline' : false,
    metafile: true,
    plugins: [
      SassPlugin(options.sass ?? {}),
      WordPressGlobalsPlugin(options.wordpress ?? {}),
      ...(options.plugins ?? []),
    ],
    watch: options.watch,
  };

  merge(esbuild_options, bundler_options);

  if (options['global-name']) {
    esbuild_options.globalName = options['global-name'];
  }

  if (options.verbose) {
    console.log('esbuild.bundle(...) options = %s', JSON.stringify(esbuild_options, null, 2));
  }

  if (esbuild_options.watch === true) {
    esbuild_options.watch = {
      async onRebuild(error, result) {
        if (error) {
          console.error('[watch] build failed:', error);
        } else {
          if (options.analyze) {
            const statistics = await esbuild.analyzeMetafile(result.metafile, {
              // verbose: options.verbose,
            });

            console.log(statistics);
          } else {
            console.log('[watch] build succeeded:', Object.keys(result.metafile.outputs));
          }
        }
      },
    };
  }

  const watch = esbuild_options.watch;
  delete esbuild_options.watch;

  const context = await esbuild.context(esbuild_options);
  const result = await context.rebuild(esbuild_options);

  if (options.analyze) {
    const statistics = await esbuild.analyzeMetafile(result.metafile, {
      // verbose: options.verbose,
    });

    console.log(statistics);
  }

  if (watch) {
    await context.watch();
  } else {
    context.dispose();
  }

  return result;
}
