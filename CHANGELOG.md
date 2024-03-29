# cm4all-wp-bundle

## 1.0.8

- #8394cec fix: integrated support for importing svg in js/css files

## 1.0.7

- fixed a security vulnerability

## 1.0.6

### Patch Changes

- updated dependencies

  - esbuild
  - sass

## 1.0.5

### Patch Changes

- ea0b053: Thanks to @motzke : fixed usage as NodeJS module
  see https://github.com/IONOS-WordPress/cm4all-wp-bundle/pull/1
- a259197: updated dependencies

## 1.0.4

### Patch Changes

- 4fb9020: add support for @wordpress/preferences-persistence and @wordpress/preferences

  WordPress 6.1 adds 2 new NPM wordpress scoped packages

  - @wordpress/preferences-persistence
  - @wordpress/preferences-persistence

  see https://make.wordpress.org/core/2022/10/10/changes-to-block-editor-preferences-in-wordpress-6-1/

  `import` statements referencing these packages will automatically transpiled to their matching `window.wp.` pendants by cm4all-wp-bundle

## 1.0.3

### Patch Changes

- 8517fcd: linter support support.

  - `make lint` will check source files

  - `make lint-fix` will fix errors in source files where possible

  vscode integration is included.

- 733f39c: add documentation for the package and the docker image

## 1.0.2

### Patch Changes

- f8ff00f: enable cli to read json config from stdin

  this feature allows you to create arbitrary json based bundler configurations and supply it to the bundler via stdin

  Example config:

  ```js
  // myconfig.json
  {
    "wordpress" : {
      "mappings" : {
        "@cm4all/debug" : "window.debug"
      }
    }
  }
  ```

  Example usage:

  ```sh
  cat ./myconfig.json | cm4all-wp-bundle-cli --outfile dist/foo in.js

  echo '{ "wordpress" : { "mappings" : { "@cm4all/foo" : "window.cm4all.foo" } }}' | cm4all-wp-bundle-cli --outdir dist foo.js
  ```

- 2fef09b: add docker image providing cm4all-wp-bundle without installing it as dependency

## 1.0.1

### Minor Changes

- updated package dependencies
