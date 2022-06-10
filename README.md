# Usage

## CLI

## JS API

- `bundle(options)`

### Options

- `boolean` `verbose` (optional, default=`false`): enabling verbose mode results in more output,
- `string}` `mode` (optional, default=`production`): possible values are `development` and `production`
- `[string]` `entryPoints`: array of entry points. At least one entry point is required. An entry point is a path to a file transpiled by esbuild.
- `string` `outdir`: target directory,
- `object<string,string>` `expose` (optional): object with entry points as keys, and global name for the generated js content as value. Example: Exposing entrypoint `foo.js` to global name `my.foo` will result in `window.my.foo = <exports of foo.js>`.
- `string` `banner` (optional): banner to be added to the generated content.
- `string` `footer` (optional): footer to be added to the generated content.
- `boolean` `watch` (optional): if true the bundle will be rebuilt when source files change
- `object` `sass` (optional): options for sass/scss plugin (see https://sass-lang.com/documentation/js-api/interfaces/Options)
