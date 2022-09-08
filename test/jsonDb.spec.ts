import { describe, test, expect } from "@jest/globals";
import { readFile } from "fs";
import { tmpNameSync } from "tmp";
import { promisify } from "util";
import { loadCassette, writeCassette } from "../src/lib/jsonDb";
import { axiosFixture } from "./fixtures/axiosFixtures";
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

  describe("writeCassette", () => {
    test("write new cassette", async () => {
      const cassetteFile = tmpNameSync();

      await writeCassette(cassetteFile, "abc123testfile", axiosFixture);
      const data = await promisify(readFile)(cassetteFile, {
        encoding: "utf8",
      });
      expect(data).toContain("abc123testfile");
    });

    test("overwrite existing cassette", async () => {
      const cassetteFile = tmpNameSync();

      await writeCassette(cassetteFile, "abc123testfile", axiosFixture);
      axiosFixture.meta.url = "http://overwritten.com/";
      await writeCassette(cassetteFile, "abc123testfile", axiosFixture);

      const data = await promisify(readFile)(cassetteFile, {
        encoding: "utf8",
      });
      expect(data).toContain("http://overwritten.com");
    });
  });
});
