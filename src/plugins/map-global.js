import sass from "sass";
import package_json from "../../package.json" assert { type: "json" };
import { resolve, dirname } from "node:path";
import { readFileSync } from "node:fs";

export default function MaGlobalPlugin({
  mapToGlobal = {},
  exposeToGlobal = null,
}) {}
