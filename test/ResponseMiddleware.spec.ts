import {
  describe,
  expect,
  test,
  beforeAll,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { failure, success } from "../src/lib/ResponseMiddleware";
import { axiosFixture, axiosResponse } from "./fixtures/axiosFixtures";
import { fixtureFile } from "./util";
import tmp from "tmp";
import { readFileSync, unlinkSync } from "fs";
import { AxiosFixture, AxiosFixtureResponse } from "../src/lib/AxiosFixture";
import md5 from "md5";
import { AxiosError } from "axios";

describe("ResponseMiddleware", () => {
  beforeAll(tmp.setGracefulCleanup);

  describe("success", () => {
    test("it returns an interceptor with saved response when available", async () => {
      const interceptor = success(fixtureFile("test-cassettes.json"));
      const fileContentStart = md5(
        readFileSync(fixtureFile("test-cassettes.json"))
      );

      expect(typeof interceptor).toBe("function");
      const result = await interceptor({
        _fixture: true,
        ...axiosFixture.originalResponseData,
      } as AxiosFixtureResponse);
      expect(result).toEqual(axiosFixture.originalResponseData);

      const fileContentEnd = md5(
        readFileSync(fixtureFile("test-cassettes.json"))
      );
      expect(fileContentEnd).toEqual(fileContentStart);
    });

    test("it does not overwrite responses", async () => {
      const interceptor = success(fixtureFile("test-cassettes.json"));
      const fileContentStart = md5(
        readFileSync(fixtureFile("test-cassettes.json"))
      );

      expect(typeof interceptor).toBe("function");
      const result = await interceptor({
        _fixture: false,
        ...axiosFixture.originalResponseData,
      } as AxiosFixtureResponse);
      expect(result).not.toEqual(axiosFixture.originalResponseData);

      const fileContentEnd = md5(
        readFileSync(fixtureFile("test-cassettes.json"))
      );
      expect(fileContentEnd).toEqual(fileContentStart);
    });

    describe("unsaved response", () => {
      let tmpFile: string;
      beforeEach(() => {
        tmpFile = tmp.tmpNameSync();
      });

      afterEach(() => unlinkSync(tmpFile));

      test("it returns a saving interceptor", async () => {
        const interceptor = success(tmpFile);
        expect(typeof interceptor).toBe("function");
        const response = await interceptor(axiosResponse);
        const savedResponse: AxiosFixture[] = Object.values(
          JSON.parse(readFileSync(tmpFile, { encoding: "utf8" }))
        );
        expect(savedResponse[0].originalResponseData).toEqual(response);
      });
    });
  });

  describe("failure", () => {
    test("returns an unmodified error", async () => {
      const error = new AxiosError("jest");
      const result = await failure(error);
      expect(result).toEqual(error);
    });
  });
});
