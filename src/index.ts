import * as Cassettes from "./lib/Cassettes";
import * as jsonDb from "./lib/jsonDb";
import * as Matchers from "./lib/Matchers";

export const mountCassette = Cassettes.mountCassette;
export const ejectCassette = Cassettes.ejectCassette;
export const loadCassette = jsonDb.loadCassette;
export const writeCassette = jsonDb.writeCassette;
export const simpleMatcher = Matchers.simpleMatcher;
export const defaultMatcher = Matchers.defaultMatcher;
