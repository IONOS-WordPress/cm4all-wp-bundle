# cm4all-wp-bundle

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
