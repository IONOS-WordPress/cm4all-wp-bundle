🚧 This project under development. Code and API may change. 🚧

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

> If you are not planning to use additional [esbuild plugins](https://esbuild.github.io/plugins/) I would suggest you to use the [`'lgersman/cm4all-wp-bundle'`](https://hub.docker.com/repository/docker/lgersman/cm4all-wp-bundle) [Docker](https://docs.docker.com/) image since it minimizes the hassle (NodeJS version/package dependency bloating) of your project.

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

@TODO: json schema

## Javascript API

@TODO:
