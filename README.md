# Introduction

`cm4all-wp-bundle` is a nano-sized JS/CSS bundler for [WordPress](https://make.wordpress.org/)/[Gutenberg](https://wordpress.org/gutenberg/) related projects.

The provided bundler transpiles JavaScript and JSX (including CSS `import` statements) into bundled Javascript/CSS runnable in the Browser.

> What means Transpilation/bundling ?
>
> JavaScript imports of `@wordpress/*` and `react` NPM packages will be transformed to their matching global pendants (`window.wp.*` and `window.react`). JSX/PostCSS/SCSS support is built-in.

It can act as a lightweight (and expotential faster) alternative to the `build` script provided by [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts).

> `cm4all-wp-bundle` uses [esbuild](https://esbuild.github.io/) and [sass](https://www.npmjs.com/package/sass) under the hood to provide JavaScript/SCSS/Sass transpilation capabilities instead of [webpack](https://webpack.js.org/). And nothing more.

## Target audience

If you are developing Javascript/CSS for the [WordPress](https://make.wordpress.org/)/[Gutenberg](https://wordpress.org/gutenberg/) Ecosystem like [Wordpress plugins/themes](https://wordpress.org/plugins/) or [WordPress blocks](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/) this package will give you the opportunity to much faster build times and less project dependencies.

# Installation

The package can be used as NPM package [`cm4all-wp-bundle`](https://www.npmjs.com/package/cm4all-wp-bundle) or preinstalled in [Docker](https://docs.docker.com/) image [`'lgersman/cm4all-wp-bundle'`](https://hub.docker.com/repository/docker/lgersman/cm4all-wp-bundle).

> If you are not planning to use additional [esbuild plugins](https://esbuild.github.io/plugins/) I would suggest you to use the [`'lgersman/cm4all-wp-bundle'`](https://hub.docker.com/repository/docker/lgersman/cm4all-wp-bundle) [Docker](https://docs.docker.com/) image since it minimizes the hassle (NodeJS version/package dependency bloating) of your project configuration.

## Docker

You don't need to install anything when using the docker image - just execute a container, the docker image will be downloaded on demand :

```sh
docker run
  -i \
  --rm \
  --mount type=bind,source=$(pwd)/your-repo,target=/app \
  lgersman/cm4all-wp-bundle:latest \
  --outdir=dist/ \
  ./src/gutenberg-extension.js
  ./src/blocks/my-block/edit.js
```

More [Docker](https://docs.docker.com/) image specific documentation can be found at the official [`'lgersman/cm4all-wp-bundle'`](https://hub.docker.com/repository/docker/lgersman/cm4all-wp-bundle) docker hub page.

## NPM

Executing `npm install --save-dev cm4all-wp-bundle` will install the package as development dependency in your project.

The NPM package provides a same named package script `cm4all-wp-bundle` which can be used in your build scripts.

```json
  ...
  "scripts": {
      ...
      "build": "cm4all-wp-bundle --outdir=./dist ./src/gutenberg-extension.js ./src/blocks/my-block/edit.js"
      ...
    },
  ...
```

If you want to execute the bundler directly in your Javascript Code (or planning to use additional [esbuild plugins](https://esbuild.github.io/plugins/)) you can even use the JavaScript API:

```js
import bundle from 'cm4all-wp-bundle';

...

await bundle({
  entryPoints: ['./src/gutenberg-extension.js', './src/blocks/my-block/edit.js'],
  outdir: './test/fixtures/wordpress/build',
});
```

# Configuration

## CLI

The bundler script `cm4all-wp-bundle` provided by the package supports various commandline arguments :

### Arguments

- `--watch`/`-w`

  (optional)

  Listen for changes on the file system and to rebuild whenever a file changes that could invalidate the build.

- `--verbose`/`-v`

  (optional)

  Produces more verbose log output.

- `--mode=[production|development]`

  (default=production)

  Produces a production (\*.min.\*) or development version of bundled js/css code.

  In case of `mode == 'production'` the transpiled sources will also be [minifed](https://esbuild.github.io/api/#minify).

- `--banner=<string>`

  (default='')

  Use this to insert an arbitrary string at the beginning of generated JavaScript and CSS files.

- `--footer=<string>`

  (default='')

  Use this to insert an arbitrary string at the end of generated JavaScript and CSS files.

- `--target=<string>`

  (default='esnext') May occur multiple times.

  Target environments for the generated JavaScript and/or CSS code (see https://esbuild.github.io/api/#target).

- `--global-name=<string>`

  (optional)

  Sets the name of the global variable which is used to store the exports from the entry point.

  Can only be used if a single file gets transpiled (see https://esbuild.github.io/api/#global-name)

- `--analyze=<boolean>`

  (default=false) Generates an easy-to-read report about the contents of your bundle

- `--outdir=<path>`

  (default=[current working directory])

  This option sets the output directory for the build operation.

### Advanced CLI configuration

In advance to the commandline arguments you reconfigure almost any [esbuild](https://esbuild.github.io/) option using STDIN to the bundler.

The STDIN CLI interface let's you override presets preconfigured using the commandline arguments.

You can provide the advanced configuration

- using a file

  ```json
  // cm4all-wp-bundle.json
  {
    "wordpress": {
      // adds additional mapping from import statements => global variable (window.*)
      "mappings": {
        "@cm4all-impex/debug": "wp.impex.debug",
        "@cm4all-impex/filters": "wp.impex.filters",
        "React": "React"
      }
    }
  }
  ```

  and execute

  ```sh
  cat ./cm4all-wp-bundle.json | \
  cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  ```

  Same same using the docker image:

  ```sh
  cat ./cm4all-wp-bundle.json | \
  docker run -i --rm -v $(pwd):/app lgersman/cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  ```

- using `echo`

  ```sh
  echo '{ "wordpress" : { "mappings" : { "@cm4all-impex/debug" : "wp.impex.debug", "@cm4all-impex/filters" : "wp.impex.filters", "React": "React" } }}' | \
  cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  ```

  The `docker` command looks quite similar as you might guess:

  ```sh
  echo '{ "wordpress" : { "mappings" : { "@cm4all-impex/debug" : "wp.impex.debug", "@cm4all-impex/filters" : "wp.impex.filters", "React": "React" } }}' | \
  docker run -i --rm -v $(pwd):/app lgersman/cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  ```

- using `cat` and shell HEREDOC syntax :

  ```sh
  cat << EOF | cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  {
    "wordpress" : {
      "mappings" : {
        "@cm4all-impex/debug" : "wp.impex.debug",
        "@cm4all-impex/filters" : "wp.impex.filters",
        "React": "React"
      }
    }
  }
  EOF
  ```

  Same same using the docker image:

  ```sh
  cat << EOF | docker run -i --rm -v $(pwd):/app lgersman/cm4all-wp-bundle --global-name=wp.impex.store --outdir=./dist ./src/wp.impex.store.mjs
  {
    "wordpress" : {
      "mappings" : {
        "@cm4all-impex/debug" : "wp.impex.debug",
        "@cm4all-impex/filters" : "wp.impex.filters",
        "React": "React"
      }
    }
  }
  EOF
  ```

### Advanced JSON Schema structure

The JSON provided via STDIN must match the `cm4all-wp-bundle` JSON Schema (can be found here : [bundle-configuration.schema.json](blob/develop/bundle-configuration.schema.json)).

The `cm4all-wp-bundle` JSON Schema declares 3 top level properties :

- `"wordpress" : { ... }`

  This property may be used to define additional _import-package_ => _global_variable_ mappings using the sub property `"mappings"`. Using this property you can declare additional _import-package_ => _global_variable_ mappings to apply during transpilation. Each entry in `"mappings"` declares a single mappings where the _key_ is the _import-package_ and the _value_ the global variable to map to.

  See https://github.com/IONOS-WordPress/cm4all-wp-bundle/blob/develop/src/plugins/wordpress.js to get a picture of all by default mapped packages.

  An example:

  Suppose you want to use NPM package [`"debug"`](https://www.npmjs.com/package/debug). But this package should not be bundled in your code. And you've already managed that this package is already in the browser in global variable `window.myapp.debug`;

  This scenario can simply expressed using the Advanced JSON Schema configuration :

  ```json
  {
    "wordpress": {
      "mappings": {
        "debug": "myapp.debug"
      }
    }
  }
  ```

  _The mapping target will automatically be prefixed with `"window."`_

- `"sass" : { ... }`

  The `"sass"` property can be used to express a custom sass configuration to the bundler.

  An example :

  You have some shared Sass files located somewhere else in your project repository and use them in your code :

  ```css
  ...
  /*
    this file is located in ./src/components/my-component.scss
  */
  ...
  /*
    common.sass is located in ./shared-css/
  */
  @import common.sass;
  ...
  ```

  To get the Sass compiler a chance to find these shared files you could use the Sass option [`"loadPaths"`](https://sass-lang.com/documentation/js-api/interfaces/Options#loadPaths)

  ```json
  {
    "sass": {
      "loadPaths": ["./shared-css/"]
    }
  }
  ```

  _You can provide Sass any configuration property as stated in the [Sass compiler documentation](https://sass-lang.com/documentation/js-api)._

- `"eslint" : { ... }`

  Using this property it's possible to customize the `esbuild's` transpilation process.

  An example:

  Suppose you want

  - configuring a loader for a given file type lets you load that file type with an import statement or a require call. For example, configuring the `.png` file extension to use the data URL loader means importing a `.png` file gives you a data URL containing the contents of that image:

    ```js
    import url from './example.png';
    let image = new Image();
    image.src = url;
    document.body.appendChild(image);

    import svg from './example.svg';
    let doc = new DOMParser().parseFromString(svg, 'application/xml');
    let node = document.importNode(doc.documentElement, true);
    document.body.appendChild(node);
    ```

    The above code can be bundled using the the following advanced configuration :

    ```json
    {
      "eslint": {
        "loader": {
          ".png": "dataurl",
          ".svg": "text"
        }
      }
    }
    ```

  - let's add another condition : We want accidental `console.*` and `debugger` statements to be removed. This can be done using `esbuild's` [drop](https://esbuild.github.io/api/#drop) option :

    ```json
    {
      "eslint": {
        "loader": {
          ".png": "dataurl",
          ".svg": "text"
        },
        "drop": ["console", "debugger"]
      }
    }
    ```

  > Please note that [cm4all-wp-bundle](https://github.com/IONOS-WordPress/cm4all-wp-bundle) already need to preconfigure some esbuild options to get your sources correctly transformed. So it might be that case that you override preconfigured options using the `cm4all-wp-bundle` JSON Schema configuration. Use can use the bundlers `verbose` options esbuild options get computed by `cm4all-wp-bundle`.

  _You can provide [esbuild](https://esbuild.github.io/api/#build-api) any of it's configuration options using the `"esbuild"` property._

#### Editing/Validation support

You can get editing/validation support for your file based `cm4all-wp-bundle` JSON Schema configuration. Create a new JSON file with following contents:

```json
{
  "$schema": "https://github.com/IONOS-WordPress/cm4all-wp-bundle/blob/develop/bundle-configuration.schema.json"
}
```

_If you've installed the `cm4all-wp-bundle` NPM package you can also reference the locally installed JSON schema file contained in the package (a lot of JSON Schema supporting editor alternatives to VSCode is available online)._

Voilà - VSCode (and any other Schema aware editor) provides you autocompletion, documentation and so on.

## Javascript API

The JavaScript API of this package let's you integrate the bundler into custom JavaScript build scripts.

The package exports a single function [`async bundle(options)`](https://github.com/IONOS-WordPress/cm4all-wp-bundle/blob/develop/src/cm4all-wp-bundle.js) exposing the bundler.

Example (see [tests](https://github.com/IONOS-WordPress/cm4all-wp-bundle/blob/develop/test/test-in-browser.js) for real live usage) :

```js
...
await bundle({
  mode: 'development',
  entryPoints: ['./test/fixtures/wordpress/mylib.js', './test/fixtures/wordpress/figure.js'],
  wordpress: {
    mappings: {
      './mylib.js': 'window.my.lib',
    },
  },
  outdir: './test/fixtures/wordpress/build',
});
...
```

The options argument has the same shape as esbuild's [`build/buildSync(...)`](https://esbuild.github.io/api/#build-api) function.

Please refer to [esbuild's build `options` documentation](https://esbuild.github.io/api/#simple-options) to see all available options.
