# Usage

@TODO:

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

See https://github.com/IONOS-WordPress/cm4all-wp-bundle#configuration

@TODO: example how to provide config to the docker image
