import { join, normalize, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// we cannot use
// import package_json from './../../package.json' assert { type: 'json' };
// since import...assert its not (yet) supported by eslint
const package_json = JSON.parse(readFileSync(dirname(fileURLToPath(import.meta.url)) + '/../../package.json'));

const DEFAULT_WORDPRESS_GLOBAL_MAPPINGS = {
  '@wordpress/a11y': 'window.wp.a11y',
  '@wordpress/api-fetch': 'window.wp.apiFetch',
  '@wordpress/autop': 'window.wp.autop',
  '@wordpress/blob': 'window.wp.blob',
  '@wordpress/block-editor': 'window.wp.blockEditor',
  '@wordpress/block-library': 'window.wp.blockLibrary',
  '@wordpress/block-serialization-default-parser': 'window.wp.blockSerializationDefaultParser',
  '@wordpress/blocks': 'window.wp.blocks',
  '@wordpress/components': 'window.wp.components',
  '@wordpress/compose': 'window.wp.compose',
  '@wordpress/core-data': 'window.wp.coreData',
  '@wordpress/data': 'window.wp.data',
  '@wordpress/date': 'window.wp.date',
  '@wordpress/deprecated': 'window.wp.deprecated',
  '@wordpress/dom': 'window.wp.dom',
  '@wordpress/dom-ready': 'window.wp.domReady',
  '@wordpress/edit-post': 'window.wp.editPost',
  '@wordpress/editor': 'window.wp.editor',
  '@wordpress/element': 'window.wp.element',
  '@wordpress/escape-html': 'window.wp.escapeHtml',
  '@wordpress/format-library': 'window.wp.formatLibrary',
  '@wordpress/hooks': 'window.wp.hooks',
  '@wordpress/html-entities': 'window.wp.htmlEntities',
  '@wordpress/i18n': 'window.wp.i18n',
  '@wordpress/is-shallow-equal': 'window.wp.isShallowEqual',
  '@wordpress/keyboard-shortcuts': 'window.wp.keyboardShortcuts',
  '@wordpress/keycodes': 'window.wp.keycodes',
  '@wordpress/media-utils': 'window.wp.mediaUtils',
  '@wordpress/notices': 'window.wp.notices',
  '@wordpress/plugins': 'window.wp.plugins',
  '@wordpress/primitives': 'window.wp.primitives',
  '@wordpress/priority-queue': 'window.wp.priorityQueue',
  '@wordpress/reusable-blocks': 'window.wp.reusableBlocks',
  '@wordpress/rich-text': 'window.wp.richText',
  '@wordpress/server-side-render': 'window.wp.serverSideRender',
  '@wordpress/shortcode': 'window.wp.shortcode',
  '@wordpress/token-list': 'window.wp.tokenList',
  '@wordpress/url': 'window.wp.url',
  '@wordpress/viewport': 'window.wp.viewport',
  '@wordpress/warning': 'window.wp.warning',
  '@wordpress/wordcount': 'window.wp.wordcount',
  react: 'window.React',
  'react-dom': 'window.ReactDom',
  '@wordpress/preferences': 'window.wp.preferences',
  '@wordpress/preferences-persistence': 'window.wp.preferencesPersistence',
};

export default function WordpressPlugin(options = {}) {
  const name = package_json.name + '-wordpress-plugin';
  return {
    name,
    setup(build) {
      const global_mappings = {
        ...DEFAULT_WORDPRESS_GLOBAL_MAPPINGS,
        ...(options.mappings ?? {}),
      };
      const verbose = options.verbose ?? false; //['info', 'debug', 'verbose'].includes(build?.initialOptions)

      if (verbose) {
        // eslint-disable-next-line no-console
        console.log({ global_mappings });
      }

      const filesToFilter = Object.keys(global_mappings).map((fileToFilter) =>
        fileToFilter.replace(/[^A-Za-z0-9_]/g, '\\$&'),
      );
      const filter = new RegExp(`^(${filesToFilter.join('|')})$`);

      build.onResolve({ filter }, async (args) => {
        const retval = { path: args.path };

        // delegate to our onLoad callback if the module is mapped to a global variable
        if (!!global_mappings[args.path]) {
          retval.namespace = name;
          if (args.path.startsWith('.')) {
            retval.pluginData = {
              path: normalize(join(args.resolveDir, args.path)),
              errors: [],
            };
          }
        } else {
          retval.namespace = args.namespace;
        }
        return retval;
      });

      build.onLoad({ filter: /.*/, namespace: name }, async (args) => {
        return {
          contents: `module.exports = ${global_mappings[args.path]};`,
        };
      });
    },
  };
}
