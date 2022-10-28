# General

This image is a prebundled version of NPM package [`cm4all-wp-bundle`](https://www.npmjs.com/package/cm4all-wp-bundle) usable without all the hassle of providing the right NodeJS version on your system and so on.

[`cm4all-wp-bundle`](https://www.npmjs.com/package/cm4all-wp-bundle) is a specialized JS/CSS bundler for transpiling JS/CSS code targeting the [WordPress](https://make.wordpress.org/)/[Gutenberg](https://wordpress.org/gutenberg/) environment.

see https://github.com/IONOS-WordPress/cm4all-wp-bundle for more details.

## Target audience

If you are developing Javascript/CSS for the [WordPress](https://make.wordpress.org/)/[Gutenberg](https://wordpress.org/gutenberg/) Ecosystem like [Wordpress plugins/themes](https://wordpress.org/plugins/) or [WordPress blocks](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-blocks/) this image will give you the opportunity to much faster build times and less project dependencies.

# Usage

You can use the image to transpile your [WordPress](https://make.wordpress.org/)/[Gutenberg](https://wordpress.org/gutenberg/) sources using

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

The same can be expressed using a `docker-compose.yml` file

```docker
version: '3.3'
services:
    cm4all-wp-bundle:
      image: lgersman/cm4all-wp-bundle:latest
      stdin_open: true
      command:
        - --outdir=dist/
        - ./src/gutenberg-extension.js
        - ./src/blocks/my-block/edit.js
      volumes:
        - type: bind
          source: ${PWD}
          target: /app
```

executed using `docker-compose run --rm cm4all-wp-bundle`

# Configuration

Head over to https://github.com/IONOS-WordPress/cm4all-wp-bundle#configuration for all configuration options.

NPM package ["`cm4all-wp-bundle`"](https://www.npmjs.com/package/cm4all-wp-bundle) contains also examples using this docker image with various configuration options.
