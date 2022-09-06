import { describe, test, expect } from "@jest/globals";
import { loadCassette } from "../src/lib/jsonDb";
import { fixtureFile } from "./util";

describe("jsonDb", () => {
  describe("loadCassette", () => {
    test("load existing cassette", async () => {
      const result = await loadCassette(
        fixtureFile("test-cassettes.json"),
        "4dcec3f20f55cf2fa260bd6e9dea2e63"
      );
      expect(result?.fixture).toBe(true);
    });

    test("throw error when cassette db does not exist", async () => {
      const result = await loadCassette(
        "no-cassettes.json",
        "4dcec3f20f55cf2fa260bd6e9dea2e63"
      );
      expect(result).toEqual({});
    });
  });
});
