---
"@lgersman-wickeltisch/wp-esbuild-bundle": major
---

enable cli to read json config from stdin

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
cat ./myconfig.json | wp-esbuild-bundle-cli --outfile dist/foo in.js

echo '{ "wordpress" : { "mappings" : { "@cm4all/foo" : "window.cm4all.foo" } }}' | wp-esbuild-bundle-cli --outdir dist foo.js
```
