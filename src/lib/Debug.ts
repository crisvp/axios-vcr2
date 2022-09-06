import Debug from "debug";
import { basename } from "path";

interface Debuggers {
  [index: string]: Debug.Debugger;
}
const _debug: Debuggers = {};

function debugFunction(identifier: string) {
  if (typeof _debug[identifier] !== "undefined") return _debug[identifier];

  _debug[identifier] = Debug(`axios-vcr2:${basename(identifier)}`);
  return _debug[identifier];
}

export default (identifier: string): Debug.Debugger =>
  debugFunction(identifier);
