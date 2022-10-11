---
"@lgersman-wickeltisch/wp-esbuild-bundler": major
---

enable cli to read json config from stdin

this feature allows you to create arbitrary bundler configuration and supply it to the bundler via stdin

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

```sh
cat ./myconfig.json | wp-esbuild-bundler --outfile dist/foo in.js
```
