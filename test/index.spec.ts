import { describe, test, expect, beforeAll, beforeEach } from "@jest/globals";
import axios from "axios";
import { mountCassette, ejectCassette } from "../src";
import { axiosRequestConfig } from "./fixtures/axiosFixtures";
import { fixtureFile } from "./util";
import tmp from "tmp";
import nock from "nock";
import { copyFileSync, existsSync, statSync } from "fs";
import { promisify } from "util";
import { readFile } from "fs";

describe("index", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  describe("mountCassette", () => {
    test("with default client", async () => {
      mountCassette(fixtureFile("test-cassettes.json"));
      const response = await axios.get(
        "http://www.example.com/",
        axiosRequestConfig
      );
      expect(response.headers.date).toEqual("Fri, 02 Sep 2022 17:04:25 GMT");
      ejectCassette(fixtureFile("test-cassettes.json"));
    });

    test("with custom matcher", async () => {
      mountCassette(fixtureFile("test-cassettes.json"), axios, () => "xyz123");
      const response = await axios.get(
        "http://www.example.com/",
        axiosRequestConfig
      );
      expect(response.headers.date).toEqual("Fri, 32 Sep 2022 00:00:00 GMT");
      ejectCassette(fixtureFile("test-cassettes.json"));
    });

    test("with custom client", async () => {
      const client = axios.create();
      mountCassette(fixtureFile("test-cassettes.json"), client);
      const response = await client.get(
        "http://www.example.com/",
        axiosRequestConfig
      );
      expect(response.headers.date).toEqual("Fri, 02 Sep 2022 17:04:25 GMT");
      ejectCassette(fixtureFile("test-cassettes.json"));
    });

    describe("saving responses", () => {
      beforeAll(tmp.setGracefulCleanup);

      test("when cassette file does not exist", async () => {
        nock("http://www.unsaved.example.com")
          .get("/")
          .reply(200, "mock response");
        const cassetteFile = tmp.tmpNameSync();
        expect(existsSync(cassetteFile)).toBe(false);
        mountCassette(cassetteFile);

        const response = await axios.get(
          "http://www.unsaved.example.com/",
          axiosRequestConfig
        );
        expect(response.data).toEqual("mock response");
        expect(existsSync(cassetteFile)).toBe(true);
        ejectCassette(cassetteFile);
      });

      test("when cassette file exists", async () => {
        nock("http://www.unsaved.example.com")
          .get("/")
          .reply(200, "mock response");
        const cassetteFile = tmp.tmpNameSync();
        expect(existsSync(cassetteFile)).toBe(false);
        copyFileSync(fixtureFile("test-cassettes.json"), cassetteFile);
        const fileSizeBefore = statSync(cassetteFile).size;
        expect(fileSizeBefore).toBeGreaterThan(0);

        mountCassette(cassetteFile);
        const response = await axios.get(
          "http://www.unsaved.example.com/",
          axiosRequestConfig
        );
        expect(response.data).toEqual("mock response");
        const fileSizeAfter = statSync(cassetteFile).size;
        expect(fileSizeAfter).toBeGreaterThan(fileSizeBefore);
        ejectCassette(cassetteFile);
      });

      test("when cassette file exists, after ejecting", async () => {
        nock("http://www.unsaved.example.com")
          .get("/")
          .reply(200, "mock response");
        const cassetteFile = tmp.tmpNameSync();
        copyFileSync(fixtureFile("test-cassettes.json"), cassetteFile);
        const fileSizeBefore = statSync(cassetteFile).size;
        expect(fileSizeBefore).toBeGreaterThan(0);

        mountCassette(cassetteFile);
        const response = await axios.get(
          "http://www.example.com/",
          axiosRequestConfig
        );
        expect(response.headers.date).toEqual("Fri, 02 Sep 2022 17:04:25 GMT");
        ejectCassette(cassetteFile);
        const secondResponse = await axios.get(
          "http://www.unsaved.example.com/",
          axiosRequestConfig
        );
        expect(secondResponse.data).toEqual("mock response");
        const fileSizeAfter = statSync(cassetteFile).size;
        expect(fileSizeAfter).toEqual(fileSizeBefore);
      });

      test("with multiple cassettes and matchers", async () => {
        const firstCassetteFile = tmp.tmpNameSync();
        const secondCassetteFile = tmp.tmpNameSync();
        nock("http://www.example.com/").get("/xyz123").reply(200, "xyz123");
        nock("http://www.example.com/").get("/abc456").reply(200, "abc456");

        // URLs containing xyz123 will be saved with id xyz123 to firstCassetteFile
        mountCassette(firstCassetteFile, axios, (config) =>
          config.url?.includes("xyz123") ? "xyz123" : null
        );

        // URLs containing abc456 will be saved with id abc456 to secondCassetteFile
        mountCassette(secondCassetteFile, axios, (config) =>
          config.url?.includes("abc456") ? "abc456" : null
        );

        await axios.get("http://www.example.com/xyz123", axiosRequestConfig);
        await axios.get("http://www.example.com/abc456", axiosRequestConfig);

        const firstData = await promisify(readFile)(firstCassetteFile, {
          encoding: "utf8",
        });
        expect(firstData).toContain("xyz123");
        expect(firstData).not.toContain("abc456");

        const secondData = await promisify(readFile)(secondCassetteFile, {
          encoding: "utf8",
        });
        expect(secondData).toContain("abc456");
        expect(secondData).not.toContain("xyz123");

        ejectCassette(firstCassetteFile);
        ejectCassette(secondCassetteFile);
      });
    });
  });
});
