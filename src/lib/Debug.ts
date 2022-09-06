import Debug from "debug";
import fs from "fs";
import { basename } from "path";

interface Debuggers {
  [index: string]: Debug.Debugger;
}
const _debug: Debuggers = {};

function debugFunction(identifier: string) {
  if (typeof _debug[identifier] !== "undefined") return _debug[identifier];
  const packageJson = fs.readFileSync("package.json", { encoding: "utf-8" });
  const packageInfo = JSON.parse(packageJson);

  _debug[identifier] = Debug(`${packageInfo.name}:${basename(identifier)}`);
  return _debug[identifier];
}

export default (identifier: string): Debug.Debugger =>
  debugFunction(identifier);
