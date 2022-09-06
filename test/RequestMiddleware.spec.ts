import { describe, expect, test } from "@jest/globals";
import { AxiosError } from "axios";
import { success, failure } from "../src/lib/RequestMiddleware";
import realAdapter from "axios/lib/adapters/http";
import { fixtureFile } from "./util";
import { axiosRequestConfig } from "./fixtures/axiosFixtures";

describe("RequestMiddleware", () => {
  describe("success", () => {
    test("returns an interceptor when loading new cassettes file", async () => {
      const interceptor = success(fixtureFile("new-cassettes.json"));
      const result = await interceptor(axiosRequestConfig);

      expect(typeof interceptor).toBe("function");
      expect(result).toEqual(axiosRequestConfig);
      expect(result.adapter).toEqual(realAdapter);
    });

    test("returns an interceptor when loading existing cassette", async () => {
      const interceptor = success(fixtureFile("test-cassettes.json"));
      const result = await interceptor(axiosRequestConfig);

      expect(typeof interceptor).toBe("function");
      expect(result).toEqual(axiosRequestConfig);
      expect(result.adapter).not.toEqual(realAdapter);
      expect(typeof result.adapter).toBe("function");
      if (typeof result.adapter === "function") {
        const response = await result.adapter(axiosRequestConfig);
        expect(response.status).toEqual(200);
      }
    });
  });

  describe("failure", () => {
    test("passes the error without modification", async () => {
      const e = new AxiosError("jest");
      expect(await failure(e)).toBe(e);
    });
  });
});
