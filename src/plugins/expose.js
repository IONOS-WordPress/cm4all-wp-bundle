import package_json from "../../package.json" assert { type: "json" };
import { resolve, dirname } from "node:path";
import { readFileSync } from "node:fs";

export default function ExposePlugin(
  expose = { },
) {
  const name = package_json.name + "-expose-plugin";
  return {
    name,
    setup(build) {
      const filesToFilter = Object.keys(expose).map(fileToFilter => fileToFilter.replace(/[^A-Za-z0-9_]/g, '\\$&'));
      const filter = new RegExp(`^(${filesToFilter.join("|")})$`);

      build.onResolve({ filter }, (args) => {
        return { path: args.path, namespace: name };
      });
      build.onLoad({ filter: /.*/, namespace: name }, (args) => {
        console.log('foo');
        return null;
      });
    },
  };
}
