import { describe, test, expect } from "@jest/globals";
import Debug from "../src/lib/Debug";

describe("Debug", () => {
  test("returns a debugger", () => {
    const debug = Debug("myidentifier");
    expect(typeof debug).toEqual("function");
  });

  test("returns a memoized debugger", () => {
    const debug = Debug("myidentifier");
    expect(typeof debug).toEqual("function");

    const otherDebug = Debug("myidentifier");
    expect(otherDebug).toBe(debug);
  });
});
