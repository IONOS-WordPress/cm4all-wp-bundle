import package_json from "../../package.json" assert { type: "json" };
import esbuild from "esbuild";
import { resolve, dirname, extname, join, normalize, delimiter, basename } from "node:path";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import memoize from "lodash.memoize";

const DEFAULT_WORDPRESS_GLOBAL_MAPPINGS = {
  '@wordpress/a11y' : 'window.wp.a11y',
  '@wordpress/api-fetch' : 'window.wp.apiFetch', 
  '@wordpress/autop' : 'window.wp.autop', 
  '@wordpress/blob' : 'window.wp.blob', 
  '@wordpress/block-editor' :'window.wp.blockEditor', 
  '@wordpress/block-library' :'window.wp.blockLibrary', 
  '@wordpress/block-serialization-default-parser' : 'window.wp.blockSerializationDefaultParser', 
  '@wordpress/blocks' : 'window.wp.blocks', 
  '@wordpress/components' :'window.wp.components', 
  '@wordpress/compose' :'window.wp.compose', 
  '@wordpress/core-data' :'window.wp.coreData', 
  '@wordpress/data' :'window.wp.data', 
  '@wordpress/date' : 'window.wp.date', 
  '@wordpress/deprecated' : 'window.wp.deprecated',
  '@wordpress/dom' : 'window.wp.dom', 
  '@wordpress/dom-ready' :'window.wp.domReady', 
  '@wordpress/edit-post' :'window.wp.editPost', 
  '@wordpress/editor' : 'window.wp.editor', 
  '@wordpress/element' : 'window.wp.element', 
  '@wordpress/escape-html' : 'window.wp.escapeHtml',
  '@wordpress/format-library' : 'window.wp.formatLibrary', 
  '@wordpress/hooks' :'window.wp.hooks', 
  '@wordpress/html-entities': 'window.wp.htmlEntities', 
  '@wordpress/i18n' : 'window.wp.i18n', 
  '@wordpress/is-shallow-equal' : 'window.wp.isShallowEqual', 
  '@wordpress/keyboard-shortcuts': 'window.wp.keyboardShortcuts', 
  '@wordpress/keycodes': 'window.wp.keycodes', 
  '@wordpress/media-utils': 'window.wp.mediaUtils', 
  '@wordpress/notices': 'window.wp.notices', 
  '@wordpress/plugins': 'window.wp.plugins', 
  '@wordpress/preferences':'window.wp.preferences', 
  '@wordpress/preferences-persistence': 'window.wp.preferencesPersistence', 
  '@wordpress/primitives': 'window.wp.primitives', 
  '@wordpress/priority-queue': 'window.wp.priorityQueue', 
  '@wordpress/reusable-blocks' : 'window.wp.reusableBlocks', 
  '@wordpress/rich-text' : 'window.wp.richText', 
  '@wordpress/server-side-render' : 'window.wp.serverSideRender', 
  '@wordpress/shortcode': 'window.wp.shortcode', 
  '@wordpress/token-list': 'window.wp.tokenList', 
  '@wordpress/url': 'window.wp.url', 
  '@wordpress/viewport': 'window.wp.viewport', 
  '@wordpress/warning': 'window.wp.warning', 
  '@wordpress/wordcount': 'window.wp.wordcount',
  'react': 'window.React',
  'react-dom': 'window.ReactDom',
};

const DEFAULT_WORDPRESS_RESOLVE_OPTIONS = {
  paths : process.env?.NODE_PATH.split(delimiter) ?? [process.cwd],
  packages : [

  ],
};

const requireResolver = memoize((path) => createRequire(path));

async function resolvePackage(packageName, resolveOptions, verbose) {
  const packageAlias = resolveOptions.packages[packageName];
  if(packageAlias) {
    const { resolve } = requireResolver(dirname(packageAlias));
    try {
      const module = await import(pathToFileURL(resolve(basename(packageAlias))));
      return module;
    } catch {}

    try {
      const module = await import(pathToFileURL(packageAlias));
      return module;
    } catch(ex) {
      console.log(ex);
    }
  } else {
    for (const resolvePath of resolveOptions.paths) {
      const { resolve } = requireResolver(resolvePath);
      try {
        return import(pathToFileURL(resolve(packageName)));
      } catch {}
    }
  }

  if(verbose) {
    console.warn('Could not resolve package(=%s) using resolve options(=%j)', packageName, resolveOptions);
  }

  return {};
}

export default function ExposePlugin(
  options = {},
) {
  const name = package_json.name + "-wordpress-plugin";
  return {
    name,
    setup(build) {
      const global_mappings = { ...DEFAULT_WORDPRESS_GLOBAL_MAPPINGS, ...options.mappings ?? {}};
      const resolve_options = { ...DEFAULT_WORDPRESS_RESOLVE_OPTIONS, ...options.resolve ?? {}};
      const verbose = options.verbose ?? ['info', 'debug', 'verbose'].includes(build?.initialOptions)

      console.log({ global_mappings });

      const filesToFilter = Object.keys(global_mappings).map(fileToFilter => fileToFilter.replace(/[^A-Za-z0-9_]/g, '\\$&'));
      const filter = new RegExp(`^(${filesToFilter.join("|")})$`);

      build.onResolve({ filter }, async (args) => {
        const retval = { path: args.path, };
      
        // delegate to our onLoad callback if the module is mapped to a global variable
        if(!!global_mappings[args.path]) {
          retval.namespace = name;
          if(args.path.startsWith('.')) {
            retval.pluginData = {
              path : normalize(join( args.resolveDir, args.path)),
              errors : [],
            }  
          }
        } else {
          retval.namespace = args.namespace;
        }
        return retval;
      });

      build.onLoad({ filter: /.*/, namespace: name }, async (args) => {
        const source = [`export default ${global_mappings[args.path]};`];

        // try to evaluate the named exports
        const result = args.pluginData || await build.resolve(args.path);
        if (result.errors.length == 0) {
          const resolvedPackage = await resolvePackage(result.path, resolve_options, verbose);

          const exports = Object.keys(resolvedPackage.default || resolvedPackage)
            .filter(
              (exportLiteral) =>
                !["default", "__esModule"].includes(exportLiteral),
            )
            .join(", ");

          if(exports) {
            source.push(`export const { ${exports} } = ${global_mappings[args.path]};`);
          }
        }

        return {
          contents : source.join('\n'),
        };
      });
    },
  };
}
